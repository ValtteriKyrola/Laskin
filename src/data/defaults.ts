import type { Investment, DEDInput, LayoutOption, FASTEMSNode, SensorData } from '../types';

export const defaultInvestments: Investment[] = [
  {
    id: 'meltio-abb',
    name: 'Meltio M600 Engine Robot + ABB IRB 2600',
    shortName: 'Meltio + ABB',
    cost: 180000,
    annualSavings: 45000,
    annualMaintenanceCost: 8000,
    lifespan: 12,
    description: 'DED-tulostusratkaisu robottialustalla. Sisältää integraation, asennuksen ja käyttöönottokoulutuksen.',
    color: '#3b82f6',
  },
  {
    id: 'dn-dnm5700',
    name: 'DN Solutions DNM 5700 3-akselinen työstökeskus',
    shortName: 'DNM 5700',
    cost: 130000,
    annualSavings: 38000,
    annualMaintenanceCost: 5000,
    lifespan: 15,
    description: 'Korvaa vanhan Bridgeport-jyrsinkoneen. DN Solutions DNM 5700: pöytä 1 400×670 mm, kara 12 000 rpm, Fanuc i-Series ohjaus.',
    color: '#10b981',
  },
  {
    id: 'amr-bridgeport',
    name: 'MiR250 AMR + Bridgeport-modernisointi',
    shortName: 'AMR + Bridgeport',
    cost: 70000,
    annualSavings: 22000,
    annualMaintenanceCost: 4000,
    lifespan: 10,
    description: 'Autonominen mobiilirobotti materiaalinsiirtoon + Bridgeportin CNC-muunnos.',
    color: '#f59e0b',
  },
  {
    id: 'ur10e-bridgeport',
    name: 'UR10e Cobot + Bridgeport-modernisointi',
    shortName: 'UR10e + Bridgeport',
    cost: 50000,
    annualSavings: 18000,
    annualMaintenanceCost: 3000,
    lifespan: 10,
    description: 'Yhteistyörobotti kappaleenkäsittelyyn + Bridgeportin CNC-muunnos.',
    color: '#8b5cf6',
  },
];

export const defaultDEDInput: DEDInput = {
  material: '316L',
  geometry: 'complex',
  sizeX: 200,
  sizeY: 150,
  sizeZ: 100,
  weight: 2.5,
  annualVolume: 20,
  currentProcess: 'machining',
  buyToFly: 4.5,
};

export const defaultLayout: LayoutOption = {
  id: 'layout-1',
  name: 'Layout A – Alkuperäinen',
  createdAt: new Date().toISOString(),
  machines: [
    { id: 'm1', type: 'meltio', name: 'Meltio M600', x: 80, y: 80, width: 120, height: 100, color: '#3b82f6', rotation: 0 },
    { id: 'm2', type: 'abb-robot', name: 'ABB IRB 2600', x: 220, y: 90, width: 80, height: 80, color: '#6366f1', rotation: 0 },
    { id: 'm3', type: 'machining-center', name: 'DNM 5700', x: 360, y: 80, width: 130, height: 90, color: '#10b981', rotation: 0 },
    { id: 'm4', type: 'fastems', name: 'FASTEMS MMS', x: 360, y: 220, width: 150, height: 80, color: '#f59e0b', rotation: 0 },
    { id: 'm5', type: 'amr', name: 'MiR250 AMR', x: 200, y: 240, width: 70, height: 70, color: '#ec4899', rotation: 0 },
    { id: 'm6', type: 'measurement', name: 'Mittausasema', x: 80, y: 240, width: 90, height: 70, color: '#06b6d4', rotation: 0 },
    { id: 'm7', type: 'storage', name: 'Varasto', x: 560, y: 80, width: 100, height: 160, color: '#6b7280', rotation: 0 },
  ],
  flows: [
    { id: 'f1', from: 'm7', to: 'm1', label: 'Raaka-aine' },
    { id: 'f2', from: 'm1', to: 'm3', label: 'DED-aihio' },
    { id: 'f3', from: 'm3', to: 'm6', label: 'Koneistettu osa' },
    { id: 'f4', from: 'm6', to: 'm7', label: 'Valmis osa' },
  ],
};

export const defaultFASTEMSTree: FASTEMSNode = {
  id: 'p1',
  type: 'product',
  name: 'Hydraulilohko HB-200',
  description: 'HMLV-tuote, 316L ruostumaton teräs',
  manufacturingTime: 0,
  machine: '',
  fixture: '',
  expanded: true,
  children: [
    {
      id: 'a1',
      type: 'assembly',
      name: 'Runko-kokoonpano',
      description: 'Päärungon osat',
      manufacturingTime: 0,
      machine: '',
      fixture: '',
      expanded: true,
      children: [
        {
          id: 'part1',
          type: 'part',
          name: 'Runko',
          description: 'DED-tulostettu runko-osa',
          manufacturingTime: 240,
          machine: 'Meltio M600',
          fixture: 'F-001',
          expanded: true,
          children: [
            {
              id: 'op1',
              type: 'operation',
              name: 'DED-tulostus',
              description: 'Meltio DED-tulostus',
              manufacturingTime: 180,
              machine: 'Meltio M600',
              fixture: 'F-001',
              children: [
                { id: 'nc1', type: 'program', name: 'DED_RUNKO_V3.mpf', description: 'Tulostusohjelma', manufacturingTime: 180, machine: 'Meltio M600', fixture: 'F-001', children: [] }
              ],
            },
            {
              id: 'op2',
              type: 'operation',
              name: 'Viimeistely koneistus',
              description: 'DNM 5700 koneistus',
              manufacturingTime: 60,
              machine: 'DNM 5700',
              fixture: 'F-002',
              children: [
                { id: 'nc2', type: 'program', name: 'RUNKO_FINISH_OP10.nc', description: 'Koneistusohjelma', manufacturingTime: 45, machine: 'DNM 5700', fixture: 'F-002', children: [] },
                { id: 'nc3', type: 'program', name: 'RUNKO_FINISH_OP20.nc', description: 'Porausohjelma', manufacturingTime: 15, machine: 'DNM 5700', fixture: 'F-002', children: [] },
              ],
            },
          ],
        },
        {
          id: 'part2',
          type: 'part',
          name: 'Kansi',
          description: 'Koneistettu kansiosa',
          manufacturingTime: 45,
          machine: 'DNM 5700',
          fixture: 'F-003',
          expanded: false,
          children: [
            {
              id: 'op3',
              type: 'operation',
              name: 'Tasojyrsintä',
              description: 'Pinnoitteen poisto',
              manufacturingTime: 25,
              machine: 'DNM 5700',
              fixture: 'F-003',
              children: [
                { id: 'nc4', type: 'program', name: 'KANSI_OP10.nc', description: 'Jyrsintäohjelma', manufacturingTime: 25, machine: 'DNM 5700', fixture: 'F-003', children: [] },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const sensorDataTable: SensorData[] = [
  { machine: 'Meltio M600', parameter: 'Laserin teho (W)', frequency: '100 Hz', purpose: 'Prosessin laadunvalvonta', unit: 'W' },
  { machine: 'Meltio M600', parameter: 'Sulatusaltaan lämpötila', frequency: '10 Hz', purpose: 'Materiaalin sulaminen', unit: '°C' },
  { machine: 'Meltio M600', parameter: 'Langansyöttönopeus', frequency: '10 Hz', purpose: 'Kerrostusnopeus', unit: 'mm/min' },
  { machine: 'Meltio M600', parameter: 'Suojakaasun virtaus', frequency: '1 Hz', purpose: 'Hapetuksen esto', unit: 'l/min' },
  { machine: 'DNM 5700', parameter: 'Karan kierrosnopeus', frequency: '100 Hz', purpose: 'Työkalun seuranta', unit: 'RPM' },
  { machine: 'DNM 5700', parameter: 'Leikkausvoimat (Fx,Fy,Fz)', frequency: '1 kHz', purpose: 'Työkalun kuluminen', unit: 'N' },
  { machine: 'DNM 5700', parameter: 'Servomoottorin virta', frequency: '100 Hz', purpose: 'Kuormituksen seuranta', unit: 'A' },
  { machine: 'DNM 5700', parameter: 'Jäähdytysneste lämpötila', frequency: '1 Hz', purpose: 'Terminen hallinta', unit: '°C' },
  { machine: 'MiR250 AMR', parameter: 'Sijainti (x,y)', frequency: '10 Hz', purpose: 'Navigointi ja seuranta', unit: 'm' },
  { machine: 'MiR250 AMR', parameter: 'Akun varaus', frequency: '0.1 Hz', purpose: 'Latauksen hallinta', unit: '%' },
  { machine: 'FASTEMS', parameter: 'Palletin sijainti', frequency: '1 Hz', purpose: 'Varastonhallinta', unit: '-' },
  { machine: 'FASTEMS', parameter: 'Kiinnittimen tila', frequency: '1 Hz', purpose: 'Setup-seuranta', unit: '-' },
  { machine: 'Mittausasema', parameter: 'Dimensiotoleranssi', frequency: 'Per osa', purpose: 'Laadunvarmistus', unit: 'µm' },
  { machine: 'Mittausasema', parameter: 'Pinnankarheus Ra', frequency: 'Per osa', purpose: 'Pintalaadun valvonta', unit: 'µm' },
  { machine: 'Ympäristö', parameter: 'Lämpötila & kosteus', frequency: '0.1 Hz', purpose: 'Lämpötilakompensointi', unit: '°C / %RH' },
];

export const materialProperties: Record<string, { dedScore: number; density: number; costPerKg: number; printability: string }> = {
  '316L': { dedScore: 95, density: 7.99, costPerKg: 45, printability: 'Erinomainen' },
  'Inconel625': { dedScore: 88, density: 8.44, costPerKg: 280, printability: 'Hyvä' },
  'Ti6Al4V': { dedScore: 82, density: 4.43, costPerKg: 350, printability: 'Hyvä' },
  'H13': { dedScore: 78, density: 7.80, costPerKg: 65, printability: 'Tyydyttävä' },
  'Stellite6': { dedScore: 85, density: 8.40, costPerKg: 320, printability: 'Hyvä' },
  'AlSi10Mg': { dedScore: 70, density: 2.67, costPerKg: 55, printability: 'Tyydyttävä' },
  'CuCrZr': { dedScore: 65, density: 8.90, costPerKg: 120, printability: 'Haastava' },
};
