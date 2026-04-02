import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Investment, DEDInput, LayoutOption, FASTEMSNode } from '../types';
import { defaultInvestments, defaultDEDInput, defaultLayout, defaultFASTEMSTree } from '../data/defaults';

interface AppState {
  activeTab: string;
  setActiveTab: (tab: string) => void;

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
      activeTab: 'dashboard',
      setActiveTab: (tab) => set({ activeTab: tab }),

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
    }
  )
);
