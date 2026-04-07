import { useStore } from '../../store/useStore';
import { calculateInvestment, formatCurrency, formatNumber } from '../../utils/calculations';
import { Card, KPICard, Badge } from '../ui';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Target, Award } from 'lucide-react';

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.08 } } },
  item: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } },
};

export default function Dashboard() {
  const { investments, discountRate, setActiveTab } = useStore();

  const totalCost = investments.reduce((s, i) => s + i.cost, 0);
  const totalSavings = investments.reduce((s, i) => s + i.annualSavings - i.annualMaintenanceCost, 0);
  const avgROI = investments.length > 0
    ? investments.reduce((s, i) => s + calculateInvestment(i, discountRate).roi, 0) / investments.length
    : 0;

  const bestInv = investments.length > 0
    ? investments.reduce((best, inv) =>
        calculateInvestment(inv, discountRate).npv > calculateInvestment(best, discountRate).npv ? inv : best
      , investments[0])
    : null;

  const kpis = [
    {
      label: 'Investoinnit yhteensä',
      value: formatCurrency(totalCost),
      sub: `${investments.length} vaihtoehtoa`,
      color: 'text-info',
      icon: <DollarSign size={20} />,
      tab: 'investments',
      delay: 0,
    },
    {
      label: 'Vuotuinen nettosäästö',
      value: formatCurrency(totalSavings),
      sub: 'Kaikki investoinnit',
      color: 'text-success',
      icon: <TrendingUp size={20} />,
      tab: 'investments',
      delay: 0.08,
    },
    {
      label: 'Keskimääräinen ROI',
      value: `${formatNumber(avgROI, 0)} %`,
      sub: `Diskonttokorko ${discountRate} %`,
      color: 'text-warning',
      icon: <Target size={20} />,
      tab: 'investments',
      delay: 0.16,
    },
    {
      label: 'Paras investointi (NPV)',
      value: bestInv?.shortName ?? '-',
      sub: bestInv ? formatCurrency(calculateInvestment(bestInv, discountRate).npv) + ' NPV' : '',
      color: 'text-primary-500',
      icon: <Award size={20} />,
      tab: 'investments',
      delay: 0.24,
    },
  ];

  const sections = [
    {
      id: 'layout',
      title: 'Layout-suunnitelma',
      status: 'Luonnos' as const,
      statusVariant: 'warning' as const,
      desc: 'Interaktiivinen 2D-pohjapiirros koneiden sijoittelusta ja materiaalivirroista.',
      items: ['Meltio M600 + ABB IRB 2600', 'Haas VF-2 työstökeskus', 'MiR250 AMR robotti', 'FASTEMS MMS'],
    },
    {
      id: 'ded',
      title: 'Meltio DED Use Cases',
      status: 'Analysoitu' as const,
      statusVariant: 'success' as const,
      desc: 'DED-soveltuvuusarviointi ja kustannusvertailu perinteiseen valmistukseen.',
      items: ['316L hydraulilohko', 'Inconel 625 turbiinin siipi', 'Stelliitti kulumissuoja', 'Ti6Al4V korjaustuloste'],
    },
    {
      id: 'odoo',
      title: 'Odoo ERP -selvitys',
      status: 'Osittain sopii' as const,
      statusVariant: 'warning' as const,
      desc: 'Soveltuvuusmatriisi, SWOT-analyysi ja integraatioarkkitehtuurikaavio.',
      items: ['Manufacturing MRP', 'FASTEMS-integraatio (API)', 'Quality & PLM', 'IoT-datan keruu'],
    },
    {
      id: 'quality',
      title: 'Datan keruu & laatu',
      status: 'Suunniteltu' as const,
      statusVariant: 'info' as const,
      desc: 'Datankeruuarkkitehtuuri, SPC-valvonta ja laadunvarmistusprosessi.',
      items: ['Edge computing → TSDB', 'X-bar & R-kaavio (SPC)', 'DED-prosessin mittaus', 'OPC-UA → Odoo'],
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">TAMK FieldLab – HMLV Production</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
          High Mix – Low Volume tuotantosolun suunnittelu · Harjoitustyö 2024–2025
        </p>
      </motion.div>

      {/* KPI grid */}
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

      {/* Sections grid */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        variants={stagger.container}
        initial="initial"
        animate="animate"
      >
        {sections.map((sec) => (
          <motion.div key={sec.id} variants={stagger.item}>
            <Card accent hover className="h-full">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">{sec.title}</h3>
                <Badge variant={sec.statusVariant} size="md">{sec.status}</Badge>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">{sec.desc}</p>
              <ul className="space-y-1 mb-3">
                {sec.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setActiveTab(sec.id)}
                className="text-xs text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
              >
                Avaa osio →
              </button>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Investment summary table */}
      <Card title="Investointivaihtoehtojen yhteenveto" accent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="text-left py-2.5 px-2 text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider">Investointi</th>
                <th className="text-right py-2.5 px-2 text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider">Hankinta</th>
                <th className="text-right py-2.5 px-2 text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider">Takaisinmaksu</th>
                <th className="text-right py-2.5 px-2 text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider">ROI</th>
                <th className="text-right py-2.5 px-2 text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider">NPV</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((inv) => {
                const calc = calculateInvestment(inv, discountRate);
                const isBest = inv.id === bestInv?.id;
                return (
                  <tr
                    key={inv.id}
                    className={`border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors ${
                      isBest ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                  >
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: inv.color }} />
                        <span className="text-neutral-900 dark:text-neutral-100 font-medium">{inv.shortName}</span>
                        {isBest && <Badge variant="primary" size="sm">Paras</Badge>}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right text-neutral-600 dark:text-neutral-300">{formatCurrency(inv.cost)}</td>
                    <td className="py-2.5 px-2 text-right text-neutral-600 dark:text-neutral-300">
                      {calc.paybackPeriod === Infinity ? '∞' : formatNumber(calc.paybackPeriod)} v
                    </td>
                    <td className={`py-2.5 px-2 text-right font-semibold ${calc.roi > 0 ? 'text-success' : 'text-danger'}`}>
                      {formatNumber(calc.roi, 0)} %
                    </td>
                    <td className={`py-2.5 px-2 text-right font-semibold ${calc.npv > 0 ? 'text-success' : 'text-danger'}`}>
                      {formatCurrency(calc.npv)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
