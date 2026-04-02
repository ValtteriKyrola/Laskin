import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';

export interface PresenceUser {
  name: string;
  activeTab: string;
  color: string;
  onlineAt: string;
}

const USER_COLORS = [
  '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6',
  '#ec4899', '#06b6d4', '#ef4444', '#84cc16',
];

// Stable color per username
function userColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

export function usePresence() {
  const { sessionId, userName, activeTab, setOnlineUsers } = useStore();

  useEffect(() => {
    if (!sessionId || !userName) return;

    const channel = supabase.channel(`presence-${sessionId}`, {
      config: { presence: { key: userName } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ activeTab: string; onlineAt: string }>();
        const users: PresenceUser[] = Object.entries(state).map(([name, presences]) => ({
          name,
          activeTab: presences[0]?.activeTab ?? 'dashboard',
          color: userColor(name),
          onlineAt: presences[0]?.onlineAt ?? new Date().toISOString(),
        }));
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            activeTab,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [sessionId, userName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update presence when tab changes
  useEffect(() => {
    if (!sessionId || !userName) return;
    const channel = supabase.getChannels().find((c) => c.topic === `realtime:presence-${sessionId}`);
    if (channel) {
      channel.track({ activeTab, onlineAt: new Date().toISOString() });
    }
  }, [activeTab, sessionId, userName]);
}
