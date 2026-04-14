import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { defaultInvestments, defaultLayout, defaultFASTEMSTree } from '../data/defaults';

function getStoredUserName(): string {
  return localStorage.getItem('fieldlab-username') ?? '';
}

// Skip Supabase if credentials are not configured
const supabaseConfigured =
  !!import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';

export function useSession() {
  const { sessionId, setSessionId, userName, setUserName, setInvestments, setLayouts, setFASTEMTree, addToast } = useStore();

  useEffect(() => {
    const name = getStoredUserName();
    if (!userName && name) setUserName(name);

    // If Supabase is not configured, work with localStorage only — no error shown
    if (!supabaseConfigured) return;

    const params = new URLSearchParams(window.location.search);
    const urlSession = params.get('session');

    // UUID validation to prevent injection
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    async function init() {
      if (urlSession && UUID_RE.test(urlSession)) {
        const { data, error } = await supabase.from('sessions').select('id').eq('id', urlSession).maybeSingle();
        if (!error && data) {
          setSessionId(data.id);
          await loadSessionData(data.id);
          return;
        }
      }

      if (sessionId && UUID_RE.test(sessionId)) {
        const { data, error } = await supabase.from('sessions').select('id').eq('id', sessionId).maybeSingle();
        if (!error && data) {
          await loadSessionData(data.id);
          return;
        }
      }

      await createNewSession();
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createNewSession() {
    const { data, error } = await supabase
      .from('sessions')
      .insert({ name: 'FieldLab Session' })
      .select('id')
      .single();

    if (error || !data) {
      addToast({ message: 'Sessio ei onnistu – tarkista verkkoyhteys', type: 'error' });
      return;
    }

    const sid = data.id;
    setSessionId(sid);

    const userName = getStoredUserName();
    await Promise.all([
      supabase.from('investments').insert({ session_id: sid, data: defaultInvestments, updated_by: userName }),
      supabase.from('layouts').insert({ session_id: sid, data: [defaultLayout], updated_by: userName }),
      supabase.from('fastems_tree').insert({ session_id: sid, data: defaultFASTEMSTree, updated_by: userName }),
    ]);

    const url = new URL(window.location.href);
    url.searchParams.set('session', sid);
    window.history.replaceState({}, '', url.toString());
  }

  async function loadSessionData(sid: string) {
    const [inv, lay, fas] = await Promise.all([
      supabase.from('investments').select('data').eq('session_id', sid).single(),
      supabase.from('layouts').select('data').eq('session_id', sid).single(),
      supabase.from('fastems_tree').select('data').eq('session_id', sid).single(),
    ]);

    if (inv.data) setInvestments(inv.data.data);
    if (lay.data) setLayouts(lay.data.data);
    if (fas.data) setFASTEMTree(fas.data.data);

    const url = new URL(window.location.href);
    url.searchParams.set('session', sid);
    window.history.replaceState({}, '', url.toString());
  }

  return { sessionId, userName };
}
