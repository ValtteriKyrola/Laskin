import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';

// Debounce helper
function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function useRealtime() {
  const {
    sessionId, userName,
    investments, setInvestments,
    layouts, setLayouts,
    dedInput, setDEDInput,
    fastemTree, setFASTEMTree,
    addToast,
  } = useStore();

  // Track whether a change came from us (to avoid echo)
  const ignoreNext = useRef<Record<string, boolean>>({});

  // --- Subscribe to remote changes ---
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session-${sessionId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'investments',
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        if (ignoreNext.current['investments']) { ignoreNext.current['investments'] = false; return; }
        const by = payload.new.updated_by ?? 'Joku';
        setInvestments(payload.new.data);
        addToast({ message: `${by} päivitti investointeja`, type: 'info' });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'layouts',
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        if (ignoreNext.current['layouts']) { ignoreNext.current['layouts'] = false; return; }
        const by = payload.new.updated_by ?? 'Joku';
        setLayouts(payload.new.data);
        addToast({ message: `${by} muutti layout-asettelua`, type: 'info' });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'ded_input',
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        if (ignoreNext.current['ded_input']) { ignoreNext.current['ded_input'] = false; return; }
        const by = payload.new.updated_by ?? 'Joku';
        setDEDInput(payload.new.data);
        addToast({ message: `${by} päivitti DED-analyysin`, type: 'info' });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'fastems_tree',
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        if (ignoreNext.current['fastems_tree']) { ignoreNext.current['fastems_tree'] = false; return; }
        const by = payload.new.updated_by ?? 'Joku';
        setFASTEMTree(payload.new.data);
        addToast({ message: `${by} muutti tuoterakennetta`, type: 'info' });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Push local changes to Supabase (debounced) ---
  const pushInvestments = useRef(
    debounce(async (sid: string, data: unknown, by: string) => {
      ignoreNext.current['investments'] = true;
      await supabase.from('investments').update({ data, updated_by: by, updated_at: new Date().toISOString() })
        .eq('session_id', sid);
    }, 600)
  ).current;

  const pushLayouts = useRef(
    debounce(async (sid: string, data: unknown, by: string) => {
      ignoreNext.current['layouts'] = true;
      await supabase.from('layouts').update({ data, updated_by: by, updated_at: new Date().toISOString() })
        .eq('session_id', sid);
    }, 600)
  ).current;

  const pushDED = useRef(
    debounce(async (sid: string, data: unknown, by: string) => {
      ignoreNext.current['ded_input'] = true;
      await supabase.from('ded_input').update({ data, updated_by: by, updated_at: new Date().toISOString() })
        .eq('session_id', sid);
    }, 800)
  ).current;

  const pushFASTEMS = useRef(
    debounce(async (sid: string, data: unknown, by: string) => {
      ignoreNext.current['fastems_tree'] = true;
      await supabase.from('fastems_tree').update({ data, updated_by: by, updated_at: new Date().toISOString() })
        .eq('session_id', sid);
    }, 600)
  ).current;

  // Watch investments
  const prevInv = useRef(investments);
  useEffect(() => {
    if (!sessionId || investments === prevInv.current) return;
    prevInv.current = investments;
    pushInvestments(sessionId, investments, userName);
  }, [investments, sessionId, userName, pushInvestments]);

  // Watch layouts
  const prevLay = useRef(layouts);
  useEffect(() => {
    if (!sessionId || layouts === prevLay.current) return;
    prevLay.current = layouts;
    pushLayouts(sessionId, layouts, userName);
  }, [layouts, sessionId, userName, pushLayouts]);

  // Watch dedInput
  const prevDED = useRef(dedInput);
  useEffect(() => {
    if (!sessionId || dedInput === prevDED.current) return;
    prevDED.current = dedInput;
    pushDED(sessionId, dedInput, userName);
  }, [dedInput, sessionId, userName, pushDED]);

  // Watch fastemTree
  const prevFAS = useRef(fastemTree);
  useEffect(() => {
    if (!sessionId || fastemTree === prevFAS.current) return;
    prevFAS.current = fastemTree;
    pushFASTEMS(sessionId, fastemTree, userName);
  }, [fastemTree, sessionId, userName, pushFASTEMS]);
}
