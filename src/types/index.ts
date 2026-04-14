// Investment types
export interface Investment {
  id: string;
  name: string;
  shortName: string;
  cost: number;
  annualSavings: number;
  annualMaintenanceCost: number;
  lifespan: number;
  description: string;
  color: string;
}

export interface InvestmentCalculation {
  paybackPeriod: number;
  roi: number;
  npv: number;
  irr: number;
  annualNetCashFlow: number;
}

// Layout types
export type MachineType = 'meltio' | 'abb-robot' | 'machining-center' | 'amr' | 'cobot' | 'fastems' | 'storage' | 'measurement' | 'bridgeport';

export interface Machine {
  id: string;
  type: MachineType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
}

export interface MaterialFlow {
  id: string;
  from: string;
  to: string;
  label?: string;
  labelX?: number;
  labelY?: number;
}

export interface LayoutOption {
  id: string;
  name: string;
  machines: Machine[];
  flows: MaterialFlow[];
  createdAt: string;
}

// FASTEMS types
export interface FASTEMSNode {
  id: string;
  type: 'product' | 'assembly' | 'part' | 'operation' | 'program';
  name: string;
  description: string;
  manufacturingTime: number;
  machine: string;
  fixture: string;
  children: FASTEMSNode[];
  expanded?: boolean;
}

// Odoo types
export interface OdooMatrixCell {
  module: string;
  requirement: string;
  status: 'full' | 'partial' | 'no' | 'custom';
}

// Quality types
export interface SensorData {
  machine: string;
  parameter: string;
  frequency: string;
  purpose: string;
  unit: string;
}

export interface SPCDataPoint {
  sample: number;
  mean: number;
  range: number;
  ucl: number;
  lcl: number;
  uclR: number;
  lclR: number;
  centerLine: number;
  centerR: number;
}

// Store types
export interface AppStore {
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
  fastemTree: FASTEMSNode;
  setFASTEMTree: (tree: FASTEMSNode) => void;
}
