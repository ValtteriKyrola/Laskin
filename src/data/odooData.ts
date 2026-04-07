export const odooModules = [
  'Manufacturing (MRP)',
  'Inventory',
  'Purchase',
  'Quality',
  'PLM',
  'Maintenance',
  'MES (IoT)',
];

export const fieldlabRequirements = [
  'Tuoterakenteet (BOM)',
  'Alihankinta',
  'Ostotilaukset',
  'Hienokuormitus',
  'Laadunhallinta',
  'Jäljitettävyys',
  'FASTEMS-integraatio',
];

type Status = 'full' | 'partial' | 'no' | 'custom';

export const odooMatrix: Record<string, Record<string, Status>> = {
  'Manufacturing (MRP)': {
    'Tuoterakenteet (BOM)': 'full',
    'Alihankinta': 'partial',
    'Ostotilaukset': 'partial',
    'Hienokuormitus': 'partial',
    'Laadunhallinta': 'no',
    'Jäljitettävyys': 'partial',
    'FASTEMS-integraatio': 'custom',
  },
  'Inventory': {
    'Tuoterakenteet (BOM)': 'partial',
    'Alihankinta': 'full',
    'Ostotilaukset': 'full',
    'Hienokuormitus': 'no',
    'Laadunhallinta': 'partial',
    'Jäljitettävyys': 'full',
    'FASTEMS-integraatio': 'custom',
  },
  'Purchase': {
    'Tuoterakenteet (BOM)': 'no',
    'Alihankinta': 'full',
    'Ostotilaukset': 'full',
    'Hienokuormitus': 'no',
    'Laadunhallinta': 'no',
    'Jäljitettävyys': 'partial',
    'FASTEMS-integraatio': 'no',
  },
  'Quality': {
    'Tuoterakenteet (BOM)': 'no',
    'Alihankinta': 'partial',
    'Ostotilaukset': 'no',
    'Hienokuormitus': 'no',
    'Laadunhallinta': 'full',
    'Jäljitettävyys': 'full',
    'FASTEMS-integraatio': 'partial',
  },
  'PLM': {
    'Tuoterakenteet (BOM)': 'full',
    'Alihankinta': 'no',
    'Ostotilaukset': 'no',
    'Hienokuormitus': 'no',
    'Laadunhallinta': 'partial',
    'Jäljitettävyys': 'partial',
    'FASTEMS-integraatio': 'no',
  },
  'Maintenance': {
    'Tuoterakenteet (BOM)': 'no',
    'Alihankinta': 'no',
    'Ostotilaukset': 'partial',
    'Hienokuormitus': 'no',
    'Laadunhallinta': 'partial',
    'Jäljitettävyys': 'no',
    'FASTEMS-integraatio': 'no',
  },
  'MES (IoT)': {
    'Tuoterakenteet (BOM)': 'no',
    'Alihankinta': 'no',
    'Ostotilaukset': 'no',
    'Hienokuormitus': 'full',
    'Laadunhallinta': 'partial',
    'Jäljitettävyys': 'full',
    'FASTEMS-integraatio': 'custom',
  },
};

export const swotData = {
  strengths: [
    'Täysin avoimen lähdekoodin ERP – ei lisenssimaksuja',
    'Modulaarinen rakenne, käyttöönotto vaiheittain',
    'Vahva MRP ja BOM-hallinta tuotantoon',
    'REST API kaikille moduuleille – integroitavuus',
    'Suuri yhteisö ja laaja dokumentaatio',
  ],
  weaknesses: [
    'FASTEMS MMS -integraatio vaatii räätälöintiä',
    'Hienokuormitus ei sovellu HMLV-ympäristöön sellaisenaan',
    'Käyttöönotto vaatii asiantuntijaa',
    'UI ei optimoitu tuotantolattialle (mobiili/kiosk)',
    'Raportointityökalut perustasolla',
  ],
  opportunities: [
    'Yhdistäminen FASTEMS MMS:ään API-sillan kautta',
    'IoT-integraatio konedataan (OPC-UA → Odoo)',
    'AI-pohjainen ennustava huolto Maintenance-moduuliin',
    'Täydentää HMLV-prosessia PLM-moduulilla',
    'FieldLab voi toimia referenssikohteena',
  ],
  threats: [
    'HMLV-kuormituslogiikka eroaa Odoon peruslogiikasta',
    'Ylläpitovaatimukset kasvavat räätälöinnin myötä',
    'Kilpailevat MES-järjestelmät (esim. Siemens Opcenter)',
    'Tietoturva vaatii erillisen auditoinnin',
    'Versiopäivitykset voivat rikkoa räätälöintejä',
  ],
};
