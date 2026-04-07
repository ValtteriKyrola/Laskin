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

export const categoryLabels: Record<CostCategory, string> = {
  removal:       'Vanhan koneen purku',
  foundation:    'Perustukset & lattia',
  electrical:    'Sähkötyöt',
  utilities:     'Paineilma & jäähdytys',
  equipment:     'Laitehankinnat',
  transport:     'Kuljetus & asennus',
  integration:   'Integraatio & ohjelmointi',
  safety:        'Turvallisuus & CE',
  training:      'Koulutus',
  downtime:      'Tuotantokatkos',
  infrastructure:'Jaettu infrastruktuuri',
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

export interface DowntimeMultiplier {
  days: number;
  dailyRate: number;
}

export interface CostLine {
  id: string;
  investmentId: InvestmentId;
  category: CostCategory;
  name: string;
  defaultValue: number;
  value: number;
  unit: '€';
  enabled: boolean;
  isNegative?: boolean;
  tooltip: string;
  downtime?: DowntimeMultiplier;
}

export interface InvestmentConfig {
  id: InvestmentId;
  name: string;
  icon: string;
  description: string;
}

export const investmentConfigs: InvestmentConfig[] = [
  { id: 'machine', icon: '🔧', name: 'Pääkone (DNM 5700)', description: 'Bridgeport → DN Solutions DNM 5700 3-akselinen työstökeskus' },
  { id: 'amr',     icon: '🤖', name: 'Mobiilirobotti (AMR)',description: 'AMR kappaleiden siirtoon solujen välillä' },
  { id: 'cobot',   icon: '🦾', name: 'Nivelvarsirobotti',   description: 'Cobot konepalveluun ja kappaleiden käsittelyyn' },
  { id: 'shared',  icon: '🏭', name: 'Jaetut kustannukset', description: 'Yhteiset infra-, turvallisuus- ja projektikulut' },
];
