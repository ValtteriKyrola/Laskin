import { useStore } from '../../store/useStore';
import { Card, KPICard, Badge } from '../ui';
import { motion } from 'framer-motion';
import {
  Wallet, Factory, Clock, TrendingUp,
  Wrench, Bot, Cpu, GitBranch, BarChart3, Package,
} from 'lucide-react';

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.07 } } },
  item: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.35 } } },
};

// Read live budget total from localStorage (written by InvestmentCalculator)
function readBudgetData() {
  try {
    const saved = JSON.parse(localStorage.getItem('fieldlab-budget-v1') || 'null');
    if (!saved?.machines) return { total: 378100, margin: 15 };
    const total = (saved.machines as {groups:{rows:{enabled:boolean;amount:number}[]}[]}[]).reduce(
      (s, m) => s + m.groups.reduce(
        (gs, g) => gs + g.rows.filter(r => r.enabled).reduce((rs, r) => rs + r.amount, 0), 0), 0);
    return { total, margin: saved.marginPct ?? 15 };
  } catch { return { total: 378100, margin: 15 }; }
}
function useBudgetData() {
  return readBudgetData();
}

// Machines in the FieldLab cell
const MACHINES = [
  { icon: <Factory size={16} />,  name: 'DN Solutions DNM 5700', role: 'CNC 3-akselinen työstökeskus', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { icon: <Cpu size={16} />,      name: 'Meltio Engine Robot',   role: 'DED-metallitulostus (MED)', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { icon: <Wrench size={16} />,   name: 'ABB IRB 2600',          role: 'Teollisuusrobotti (DED-solu)', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { icon: <Bot size={16} />,      name: 'MiR250 AMR',            role: 'Autonominen mobiilirobotti', color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-900/20' },
  { icon: <Bot size={16} />,      name: 'UR10e Cobot',           role: 'Yhteistyörobotti (konepalvelu)', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  { icon: <GitBranch size={16} />,name: 'FASTEMS MMS',           role: 'Tuotannonohjausjärjestelmä', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { icon: <BarChart3 size={16} />,name: 'Mittausasema (CMM)',    role: 'Koordinaattimittaus & SPC', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
];

export default function Dashboard() {
  const { setActiveTab } = useStore();
  const { total, margin } = useBudgetData();
  const withMargin = Math.round(total * (1 + margin / 100));
  const fmt = (n: number) => n.toLocaleString('fi-FI', { maximumFractionDigits: 0 }) + ' €';

  const kpis = [
    {
      label: 'Kokonaisbudjetti (ilman marginaalia)',
      value: fmt(total),
      sub: `+ ${margin}% marginaali = ${fmt(withMargin)}`,
      color: 'text-primary-500',
      icon: <Wallet size={20} />,
      tab: 'investments',
      delay: 0,
    },
    {
      label: 'Laitteita tuotantosolussa',
      value: '7 laitetta',
      sub: 'CNC · DED · 2× robotti · AMR · MMS · CMM',
      color: 'text-info',
      icon: <Factory size={20} />,
      tab: 'layout',
      delay: 0.07,
    },
    {
      label: 'Läpimenoaika / kappale',
      value: '~160 min',
      sub: '35 min asetus + 113 min työ + kuljetukset',
      color: 'text-success',
      icon: <Clock size={20} />,
      tab: 'fastems',
      delay: 0.14,
    },
    {
      label: 'Kapasiteetti (8 h/pv)',
      value: '~3 kpl/pv',
      sub: 'Modulaarinen kiinnitinlevy KL-300',
      color: 'text-warning',
      icon: <TrendingUp size={20} />,
      tab: 'fastems',
      delay: 0.21,
    },
  ];

  const sections = [
    {
      id: 'investments',
      icon: <Wallet size={15} />,
      title: 'Investointibudjetti',
      status: 'Laadittu',
      statusVariant: 'success' as const,
      desc: 'Kokonaiskustannuserittely neljälle investoinnille – hankinta, asennus, integraatio ja koulutus.',
      items: [`Pääkone (DNM 5700): ~171 000 €`, 'AMR (MiR250): ~67 000 €', 'Cobot (UR10e): ~80 000 €', 'Jaetut kustannukset: ~60 000 €'],
    },
    {
      id: 'layout',
      icon: <Factory size={15} />,
      title: 'Layout-suunnitelma',
      status: 'Luonnos',
      statusVariant: 'warning' as const,
      desc: 'Interaktiivinen 2D-pohjapiirros koneiden sijoittelusta ja materiaalivirroista tuotantosolussa.',
      items: ['Meltio DED + ABB IRB 2600 -solu', 'DN Solutions DNM 5700', 'MiR250 AMR kuljetusreitit', 'FASTEMS MMS -varasto'],
    },
    {
      id: 'fastems',
      icon: <GitBranch size={15} />,
      title: 'FASTEMS MMS – Tuoterakenne',
      status: 'Määritelty',
      statusVariant: 'success' as const,
      desc: 'Hierarkkinen tuoterakennepuu räätälöidylle kiinnitinlevylle (KL-300). 4 kokoonpanoa, 7 NC-ohjelmaa.',
      items: ['Koneistettu peruslevy (DNM 5700, 3 OP)', 'DED-korotuspala (Meltio Engine Robot)', 'Ostetut osat (ISO-standardiosat)', 'Koordinaattimittaus (CMM, OP60)'],
    },
    {
      id: 'odoo',
      icon: <Package size={15} />,
      title: 'Odoo ERP -selvitys',
      status: 'Osittain sopii',
      statusVariant: 'warning' as const,
      desc: 'Soveltuvuusmatriisi, SWOT-analyysi ja integraatioarkkitehtuurikaavio HMLV-tuotantoon.',
      items: ['Manufacturing MRP -moduuli', 'FASTEMS-integraatio (REST API)', 'Quality & PLM', 'OPC-UA → datan keruu'],
    },
    {
      id: 'quality',
      icon: <BarChart3 size={15} />,
      title: 'Datan keruu & laadunvarmistus',
      status: 'Suunniteltu',
      statusVariant: 'info' as const,
      desc: 'Datankeruuarkkitehtuuri, SPC-valvonta ja 22 mitattavaa parametria kaikista laitteista.',
      items: ['Edge computing → Time-series DB', 'X-bar & R-kaavio (SPC)', 'OPC UA (Fanuc) + MiR Fleet API', 'CMM-mittauspöytäkirja'],
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">TAMK FieldLab – HMLV Production</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
          High Mix – Low Volume tuotantosolun suunnittelu · Harjoitustyö 2024–2025
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <KPICard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            sub={kpi.sub}
            color={kpi.color}
            icon={kpi.icon}
            onClick={() => setActiveTab(kpi.tab)}
            delay={kpi.delay}
          />
        ))}
      </div>

      {/* Production cell machines */}
      <Card title="Tuotantosolun laitteet" accent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
          {MACHINES.map((m) => (
            <div key={m.name} className={`${m.bg} rounded-xl p-3 flex flex-col items-center text-center gap-1.5`}>
              <span className={`${m.color}`}>{m.icon}</span>
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 leading-tight">{m.name}</span>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">{m.role}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Section cards */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        variants={stagger.container}
        initial="initial"
        animate="animate"
      >
        {sections.map((sec) => (
          <motion.div key={sec.id} variants={stagger.item}>
            <Card accent hover className="h-full flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-primary-500">{sec.icon}</span>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">{sec.title}</h3>
                </div>
                <Badge variant={sec.statusVariant} size="sm">{sec.status}</Badge>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">{sec.desc}</p>
              <ul className="space-y-1 mb-4 flex-1">
                {sec.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full shrink-0 mt-1" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setActiveTab(sec.id)}
                className="text-xs text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors text-left"
              >
                Avaa osio →
              </button>
            </Card>
          </motion.div>
        ))}
      </motion.div>

    </div>
  );
}
