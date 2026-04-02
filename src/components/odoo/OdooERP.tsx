import Card from '../shared/Card';
import { odooModules, fieldlabRequirements, odooMatrix, swotData } from '../../data/odooData';

type Status = 'full' | 'partial' | 'no' | 'custom';

const statusConfig: Record<Status, { label: string; color: string; bg: string; icon: string }> = {
  full:    { label: 'Täysin sopii',        color: 'text-green-400',  bg: 'bg-green-900/40 border-green-700',  icon: '✓' },
  partial: { label: 'Osittain sopii',      color: 'text-yellow-400', bg: 'bg-yellow-900/40 border-yellow-700', icon: '~' },
  no:      { label: 'Ei sovellu',          color: 'text-red-400',    bg: 'bg-red-900/40 border-red-700',      icon: '✗' },
  custom:  { label: 'Vaatii räätälöintiä', color: 'text-purple-400', bg: 'bg-purple-900/40 border-purple-700', icon: '⚙' },
};

function StatusCell({ status }: { status: Status }) {
  const cfg = statusConfig[status];
  return (
    <td className="p-1.5 text-center">
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded border text-xs font-bold ${cfg.bg} ${cfg.color}`} title={cfg.label}>
        {cfg.icon}
      </span>
    </td>
  );
}

const integrationNodes = [
  { id: 'odoo', label: 'Odoo ERP', x: 350, y: 20, color: '#8b5cf6', w: 120, h: 40 },
  { id: 'fastems', label: 'FASTEMS MMS', x: 80, y: 140, color: '#f59e0b', w: 130, h: 40 },
  { id: 'meltio', label: 'Meltio M600', x: 280, y: 240, color: '#3b82f6', w: 110, h: 40 },
  { id: 'haas', label: 'Haas VF-2', x: 430, y: 240, color: '#10b981', w: 100, h: 40 },
  { id: 'amr', label: 'MiR250 AMR', x: 590, y: 140, color: '#ec4899', w: 110, h: 40 },
  { id: 'edge', label: 'Edge Computing', x: 350, y: 140, color: '#06b6d4', w: 120, h: 40 },
  { id: 'tsdb', label: 'Time-series DB', x: 620, y: 240, color: '#6b7280', w: 120, h: 40 },
];

const integrationEdges = [
  { from: 'odoo', to: 'fastems', label: 'REST API', dashed: false },
  { from: 'odoo', to: 'edge', label: 'OPC-UA', dashed: false },
  { from: 'fastems', to: 'meltio', label: 'NC-ohjelmat', dashed: true },
  { from: 'fastems', to: 'haas', label: 'NC-ohjelmat', dashed: true },
  { from: 'edge', to: 'meltio', label: 'Prosessidata', dashed: true },
  { from: 'edge', to: 'haas', label: 'Prosessidata', dashed: true },
  { from: 'edge', to: 'amr', label: 'Tehtävät', dashed: true },
  { from: 'edge', to: 'tsdb', label: 'Tallennus', dashed: false },
  { from: 'amr', to: 'fastems', label: 'Kuljetusstatus', dashed: true },
];

function getCenter(id: string) {
  const n = integrationNodes.find((n) => n.id === id);
  if (!n) return { x: 0, y: 0 };
  return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
}

export default function OdooERP() {
  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white">Odoo ERP – FieldLab-soveltuvuusselvitys</h1>
        <p className="text-gray-400 text-xs mt-0.5">Moduulikohtainen soveltuvuusmatriisi, SWOT-analyysi ja integraatioarkkitehtuuri</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <span key={key} className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded border ${cfg.bg} ${cfg.color}`}>
            <span className="font-bold">{cfg.icon}</span> {cfg.label}
          </span>
        ))}
      </div>

      {/* Matrix */}
      <Card title="Soveltuvuusmatriisi: Odoo-moduulit × FieldLab-vaatimukset">
        <div className="overflow-x-auto">
          <table className="text-xs w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-2 pr-4 text-gray-400 font-medium w-44">Moduuli</th>
                {fieldlabRequirements.map((req) => (
                  <th key={req} className="text-center py-2 px-1 text-gray-400 font-medium" style={{ minWidth: 80 }}>
                    <div className="writing-mode-vertical" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 90, textAlign: 'left', fontSize: 10 }}>
                      {req}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {odooModules.map((mod) => (
                <tr key={mod} className="border-b border-gray-800/40 hover:bg-gray-800/20">
                  <td className="py-2 pr-4 text-white font-medium">{mod}</td>
                  {fieldlabRequirements.map((req) => {
                    const status = (odooMatrix[mod]?.[req] ?? 'no') as Status;
                    return <StatusCell key={req} status={status} />;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* SWOT */}
      <Card title="SWOT-analyysi: Odoo vs. FieldLab HMLV">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { title: 'Vahvuudet', items: swotData.strengths, color: 'text-green-400', border: 'border-green-800', bg: 'bg-green-900/10', icon: '💪' },
            { title: 'Heikkoudet', items: swotData.weaknesses, color: 'text-red-400', border: 'border-red-800', bg: 'bg-red-900/10', icon: '⚠️' },
            { title: 'Mahdollisuudet', items: swotData.opportunities, color: 'text-blue-400', border: 'border-blue-800', bg: 'bg-blue-900/10', icon: '🚀' },
            { title: 'Uhat', items: swotData.threats, color: 'text-yellow-400', border: 'border-yellow-800', bg: 'bg-yellow-900/10', icon: '🔴' },
          ].map((q) => (
            <div key={q.title} className={`rounded-xl border ${q.border} ${q.bg} p-4`}>
              <h3 className={`font-bold text-sm mb-2 ${q.color}`}>{q.icon} {q.title}</h3>
              <ul className="space-y-1.5">
                {q.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="mt-0.5 shrink-0 text-gray-600">▸</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      {/* Integration architecture */}
      <Card title="Integraatioarkkitehtuurikaavio">
        <div className="overflow-x-auto">
          <svg width={760} height={310} className="bg-gray-950 rounded-lg">
            <defs>
              <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#6b7280" />
              </marker>
            </defs>
            {integrationEdges.map((e, i) => {
              const from = getCenter(e.from);
              const to = getCenter(e.to);
              const mx = (from.x + to.x) / 2;
              const my = (from.y + to.y) / 2;
              return (
                <g key={i}>
                  <line
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke="#374151" strokeWidth="1.5"
                    strokeDasharray={e.dashed ? '4,3' : 'none'}
                    markerEnd="url(#arr)"
                  />
                  <text x={mx} y={my - 4} fill="#6b7280" fontSize="8" textAnchor="middle">{e.label}</text>
                </g>
              );
            })}
            {integrationNodes.map((n) => (
              <g key={n.id}>
                <rect x={n.x} y={n.y} width={n.w} height={n.h}
                  fill={n.color} fillOpacity={0.15}
                  stroke={n.color} strokeWidth={1.5} rx={6}
                />
                <text x={n.x + n.w / 2} y={n.y + n.h / 2 + 4}
                  fill={n.color} fontSize="11" fontWeight="600" textAnchor="middle">
                  {n.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </Card>

      {/* Recommendation */}
      <Card title="Yhteenveto ja suositus">
        <div className="space-y-3 text-sm text-gray-300">
          <p>
            <span className="text-yellow-400 font-semibold">Suositus:</span>{' '}
            Odoo soveltuu TAMK FieldLabin ERP-alustaksi <span className="text-green-400 font-medium">osittain</span>.
            Manufacturing MRP, Inventory ja Purchase -moduulit kattavat perusvalmistuksen ohjauksen hyvin.
            FASTEMS MMS -integraatio ja hienokuormitus vaativat räätälöintiä tai lisämoduulin (pl. Odoo 17 MES).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: 'Vaihe 1 (0–6 kk)', desc: 'Manufacturing + Inventory + PLM käyttöönotto. BOM-rakenteiden vienti Odoo-muotoon.', color: 'border-green-700' },
              { label: 'Vaihe 2 (6–12 kk)', desc: 'REST API -silta FASTEMS MMS:ään. Quality-moduuli DED-laadunvalvontaan.', color: 'border-yellow-700' },
              { label: 'Vaihe 3 (12–18 kk)', desc: 'IoT Edge → OPC-UA → Odoo MES. Hienokuormituslogiikan räätälöinti HMLV-tarpeeseen.', color: 'border-blue-700' },
            ].map((phase) => (
              <div key={phase.label} className={`border rounded-xl p-3 ${phase.color} bg-gray-800/30`}>
                <div className="font-semibold text-white text-xs mb-1">{phase.label}</div>
                <div className="text-xs text-gray-400">{phase.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
