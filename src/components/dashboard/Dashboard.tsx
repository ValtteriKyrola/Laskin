import { useStore } from '../../store/useStore';
import { calculateInvestment, formatCurrency, formatNumber } from '../../utils/calculations';
import Card from '../shared/Card';

export default function Dashboard() {
  const { investments, discountRate, setActiveTab } = useStore();

  const totalCost = investments.reduce((s, i) => s + i.cost, 0);
  const totalSavings = investments.reduce((s, i) => s + i.annualSavings - i.annualMaintenanceCost, 0);
  const avgROI = investments.reduce((s, i) => {
    const calc = calculateInvestment(i, discountRate);
    return s + calc.roi;
  }, 0) / investments.length;

  const bestInv = investments.reduce((best, inv) => {
    const calc = calculateInvestment(inv, discountRate);
    const bestCalc = calculateInvestment(best, discountRate);
    return calc.npv > bestCalc.npv ? inv : best;
  }, investments[0]);

  const kpis = [
    {
      label: 'Investoinnit yhteensä',
      value: formatCurrency(totalCost),
      sub: `${investments.length} vaihtoehtoa`,
      color: 'text-blue-400',
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/10',
      icon: '💰',
      tab: 'investments',
    },
    {
      label: 'Vuotuinen nettosäästö',
      value: formatCurrency(totalSavings),
      sub: 'Kaikki investoinnit',
      color: 'text-green-400',
      border: 'border-green-500/30',
      bg: 'bg-green-500/10',
      icon: '📈',
      tab: 'investments',
    },
    {
      label: 'Keskimääräinen ROI',
      value: `${formatNumber(avgROI, 0)} %`,
      sub: `Diskonttokorko ${discountRate} %`,
      color: 'text-yellow-400',
      border: 'border-yellow-500/30',
      bg: 'bg-yellow-500/10',
      icon: '🎯',
      tab: 'investments',
    },
    {
      label: 'Paras investointi (NPV)',
      value: bestInv?.shortName ?? '-',
      sub: bestInv ? formatCurrency(calculateInvestment(bestInv, discountRate).npv) + ' NPV' : '',
      color: 'text-purple-400',
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/10',
      icon: '🏆',
      tab: 'investments',
    },
  ];

  const sections = [
    {
      id: 'layout',
      title: 'Layout-suunnitelma',
      status: 'Luonnos',
      statusClass: 'badge-yellow',
      desc: 'Interaktiivinen 2D-pohjapiirros koneiden sijoittelusta ja materiaalivirroista.',
      items: ['Meltio M600 + ABB IRB 2600', 'Haas VF-2 työstökeskus', 'MiR250 AMR robotti', 'FASTEMS MMS'],
    },
    {
      id: 'ded',
      title: 'Meltio DED Use Cases',
      status: 'Analysoitu',
      statusClass: 'badge-green',
      desc: 'DED-soveltuvuusarviointi ja kustannusvertailu perinteiseen valmistukseen.',
      items: ['316L hydraulilohko', 'Inconel 625 turbiinin siipi', 'Stelliitti kulumissuoja', 'Ti6Al4V korjaustuloste'],
    },
    {
      id: 'odoo',
      title: 'Odoo ERP -selvitys',
      status: 'Osittain sopii',
      statusClass: 'badge-yellow',
      desc: 'Soveltuvuusmatriisi, SWOT-analyysi ja integraatioarkkitehtuurikaavio.',
      items: ['Manufacturing MRP', 'FASTEMS-integraatio (API)', 'Quality & PLM', 'IoT-datan keruu'],
    },
    {
      id: 'quality',
      title: 'Datan keruu & laatu',
      status: 'Suunniteltu',
      statusClass: 'badge-blue',
      desc: 'Datankeruuarkkitehtuuri, SPC-valvonta ja laadunvarmistusprosessi.',
      items: ['Edge computing → TSDB', 'X-bar & R-kaavio (SPC)', 'DED-prosessin mittaus', 'OPC-UA → Odoo'],
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">TAMK FieldLab – HMLV Production</h1>
        <p className="text-gray-400 text-sm mt-1">
          High Mix – Low Volume tuotantosolun suunnittelu · Harjoitustyö 2024–2025
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <button
            key={kpi.label}
            onClick={() => setActiveTab(kpi.tab)}
            className={`text-left p-4 rounded-xl border ${kpi.border} ${kpi.bg} hover:opacity-90 transition-opacity`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{kpi.icon}</span>
              <span className="text-xs text-gray-400">{kpi.label}</span>
            </div>
            <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.sub}</div>
          </button>
        ))}
      </div>

      {/* Sections grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sections.map((sec) => (
          <Card key={sec.id}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white text-sm">{sec.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                sec.statusClass === 'badge-green' ? 'bg-green-900/50 text-green-400 border-green-800' :
                sec.statusClass === 'badge-yellow' ? 'bg-yellow-900/50 text-yellow-400 border-yellow-800' :
                'bg-blue-900/50 text-blue-400 border-blue-800'
              }`}>{sec.status}</span>
            </div>
            <p className="text-xs text-gray-400 mb-3">{sec.desc}</p>
            <ul className="space-y-1">
              {sec.items.map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-gray-300">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setActiveTab(sec.id)}
              className="mt-3 text-xs text-yellow-400 hover:text-yellow-300 font-medium"
            >
              Avaa osio →
            </button>
          </Card>
        ))}
      </div>

      {/* Investment summary table */}
      <Card title="Investointivaihtoehtojen yhteenveto">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-2 text-gray-400 font-medium">Investointi</th>
                <th className="text-right py-2 text-gray-400 font-medium">Hankintakustannus</th>
                <th className="text-right py-2 text-gray-400 font-medium">Takaisinmaksuaika</th>
                <th className="text-right py-2 text-gray-400 font-medium">ROI</th>
                <th className="text-right py-2 text-gray-400 font-medium">NPV</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((inv) => {
                const calc = calculateInvestment(inv, discountRate);
                return (
                  <tr key={inv.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: inv.color }} />
                        <span className="text-gray-200">{inv.shortName}</span>
                      </div>
                    </td>
                    <td className="py-2 text-right text-gray-300">{formatCurrency(inv.cost)}</td>
                    <td className="py-2 text-right text-gray-300">{formatNumber(calc.paybackPeriod)} v</td>
                    <td className={`py-2 text-right font-medium ${calc.roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatNumber(calc.roi, 0)} %
                    </td>
                    <td className={`py-2 text-right font-medium ${calc.npv > 0 ? 'text-green-400' : 'text-red-400'}`}>
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
