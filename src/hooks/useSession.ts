import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { defaultInvestments, defaultDEDInput, defaultLayout, defaultFASTEMSTree } from '../data/defaults';

const ADJECTIVES = ['Nopea', 'Rohkea', 'Tarkka', 'Vahva', 'Ketterä', 'Viisas', 'Luova'];
const NOUNS = ['Insinööri', 'Suunnittelija', 'Analyytikko', 'Kehittäjä', 'Asiantuntija'];

function randomName() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${noun}`;
}

function getOrCreateUserName(): string {
  const stored = localStorage.getItem('fieldlab-username');
  if (stored) return stored;
  const name = randomName();
  localStorage.setItem('fieldlab-username', name);
  return name;
}

export function useSession() {
  const { sessionId, setSessionId, userName, setUserName, setInvestments, setLayouts, setDEDInput, setFASTEMTree, addToast } = useStore();

  useEffect(() => {
    const name = getOrCreateUserName();
    if (!userName) setUserName(name);

    const params = new URLSearchParams(window.location.search);
    const urlSession = params.get('session');

    // UUID validation to prevent injection
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    async function init() {
      if (urlSession && UUID_RE.test(urlSession)) {
        // Liity olemassaolevaan sessioon
        const { data, error } = await supabase.from('sessions').select('id').eq('id', urlSession).maybeSingle();
        if (!error && data) {
          setSessionId(data.id);
          await loadSessionData(data.id);
          return;
        }
      }

      if (sessionId && UUID_RE.test(sessionId)) {
        // Käytä tallennettua sessiota
        const { data, error } = await supabase.from('sessions').select('id').eq('id', sessionId).maybeSingle();
        if (!error && data) {
          await loadSessionData(data.id);
          return;
        }
      }

      // Luo uusi sessio
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

    // Lisää oletusdata sessioon
    const userName = getOrCreateUserName();
    await Promise.all([
      supabase.from('investments').insert({ session_id: sid, data: defaultInvestments, updated_by: userName }),
      supabase.from('layouts').insert({ session_id: sid, data: [defaultLayout], updated_by: userName }),
      supabase.from('ded_input').insert({ session_id: sid, data: defaultDEDInput, updated_by: userName }),
      supabase.from('fastems_tree').insert({ session_id: sid, data: defaultFASTEMSTree, updated_by: userName }),
    ]);

    // Päivitä URL
    const url = new URL(window.location.href);
    url.searchParams.set('session', sid);
    window.history.replaceState({}, '', url.toString());
  }

  async function loadSessionData(sid: string) {
    const [inv, lay, ded, fas] = await Promise.all([
      supabase.from('investments').select('data').eq('session_id', sid).single(),
      supabase.from('layouts').select('data').eq('session_id', sid).single(),
      supabase.from('ded_input').select('data').eq('session_id', sid).single(),
      supabase.from('fastems_tree').select('data').eq('session_id', sid).single(),
    ]);

    if (inv.data) setInvestments(inv.data.data);
    if (lay.data) setLayouts(lay.data.data);
    if (ded.data) setDEDInput(ded.data.data);
    if (fas.data) setFASTEMTree(fas.data.data);

    // Päivitä URL
    const url = new URL(window.location.href);
    url.searchParams.set('session', sid);
    window.history.replaceState({}, '', url.toString());
  }

  return { sessionId, userName };
}
