export type InvestmentId = 'machine' | 'amr' | 'cobot' | 'shared';

export type CostCategory =
  | 'removal'
  | 'foundation'
  | 'electrical'
  | 'utilities'
  | 'equipment'
  | 'transport'
  | 'integration'
  | 'safety'
  | 'training'
  | 'downtime'
  | 'infrastructure'
  | 'projectMgmt';

export interface CostLine {
  id: string;
  investmentId: InvestmentId;
  category: CostCategory;
  name: string;
  defaultValue: number;
  value: number;
  unit: '€' | 'pv';
  enabled: boolean;
  isOption?: boolean;
  isToggle?: boolean;
  isNegative?: boolean;
  tooltip: string;
  multiplier?: { days: number; dailyRate: number };
}

export interface Investment {
  id: InvestmentId;
  name: string;
  icon: string;
  description: string;
  lines: CostLine[];
}

export const categoryLabels: Record<CostCategory, string> = {
  removal:       'Purku',
  foundation:    'Perustukset',
  electrical:    'Sähkötyöt',
  utilities:     'Paineilma & jäähdytys',
  equipment:     'Laitteet',
  transport:     'Kuljetus & asennus',
  integration:   'Integraatio',
  safety:        'Turvallisuus & CE',
  training:      'Koulutus',
  downtime:      'Tuotantokatkos',
  infrastructure:'Jaettu infra',
  projectMgmt:   'Projektinhallinta',
};

export const categoryColors: Record<CostCategory, string> = {
  removal:       '#EF4444',
  foundation:    '#F97316',
  electrical:    '#F59E0B',
  utilities:     '#84CC16',
  equipment:     '#7B2D8E',
  transport:     '#3B82F6',
  integration:   '#06B6D4',
  safety:        '#EC4899',
  training:      '#10B981',
  downtime:      '#6B7280',
  infrastructure:'#8B5CF6',
  projectMgmt:   '#14B8A6',
};
