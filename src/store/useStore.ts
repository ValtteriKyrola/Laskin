import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Investment, DEDInput, LayoutOption, FASTEMSNode } from '../types';
import { defaultInvestments, defaultDEDInput, defaultLayout, defaultFASTEMSTree } from '../data/defaults';
import type { PresenceUser } from '../hooks/usePresence';

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

interface AppState {
  // Theme
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Session & collaboration
  sessionId: string | null;
  setSessionId: (id: string) => void;
  userName: string;
  setUserName: (name: string) => void;
  onlineUsers: PresenceUser[];
  setOnlineUsers: (users: PresenceUser[]) => void;

  // Toasts
  toasts: Toast[];
  addToast: (t: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // App data
  investments: Investment[];
  setInvestments: (investments: Investment[]) => void;
  discountRate: number;
  setDiscountRate: (rate: number) => void;

  layouts: LayoutOption[];
  setLayouts: (layouts: LayoutOption[]) => void;
  activeLayoutId: string | null;
  setActiveLayoutId: (id: string | null) => void;

  dedInput: DEDInput;
  setDEDInput: (input: DEDInput) => void;

  fastemTree: FASTEMSNode;
  setFASTEMTree: (tree: FASTEMSNode) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      isDark: true,
      setIsDark: (isDark) => set({ isDark }),

      // Navigation
      activeTab: 'dashboard',
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Session
      sessionId: null,
      setSessionId: (sessionId) => set({ sessionId }),
      userName: '',
      setUserName: (userName) => set({ userName }),
      onlineUsers: [],
      setOnlineUsers: (onlineUsers) => set({ onlineUsers }),

      // Toasts (not persisted)
      toasts: [],
      addToast: (t) => set((s) => ({
        toasts: [...s.toasts, { ...t, id: `toast-${Date.now()}-${Math.random()}` }],
      })),
      removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      // App data
      investments: defaultInvestments,
      setInvestments: (investments) => set({ investments }),
      discountRate: 8,
      setDiscountRate: (discountRate) => set({ discountRate }),

      layouts: [defaultLayout],
      setLayouts: (layouts) => set({ layouts }),
      activeLayoutId: defaultLayout.id,
      setActiveLayoutId: (activeLayoutId) => set({ activeLayoutId }),

      dedInput: defaultDEDInput,
      setDEDInput: (dedInput) => set({ dedInput }),

      fastemTree: defaultFASTEMSTree,
      setFASTEMTree: (fastemTree) => set({ fastemTree }),
    }),
    {
      name: 'fieldlab-storage',
      // Don't persist ephemeral state
      partialize: (s) => ({
        isDark: s.isDark,
        activeTab: s.activeTab,
        sessionId: s.sessionId,
        userName: s.userName,
        investments: s.investments,
        discountRate: s.discountRate,
        layouts: s.layouts,
        activeLayoutId: s.activeLayoutId,
        dedInput: s.dedInput,
        fastemTree: s.fastemTree,
      }),
    }
  )
);
