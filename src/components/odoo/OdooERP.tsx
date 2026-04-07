import { Card, Badge } from '../ui';
import { odooModules, fieldlabRequirements, odooMatrix, swotData } from '../../data/odooData';

type Status = 'full' | 'partial' | 'no' | 'custom';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'primary';
const statusConfig: Record<Status, { label: string; variant: BadgeVariant; icon: string; cellClass: string }> = {
  full:    { label: 'Täysin sopii',        variant: 'success', icon: '✓', cellClass: 'bg-success/20' },
  partial: { label: 'Osittain sopii',      variant: 'warning', icon: '~', cellClass: 'bg-warning/10' },
  no:      { label: 'Ei sovellu',          variant: 'danger',  icon: '✗', cellClass: 'bg-danger/10' },
  custom:  { label: 'Vaatii räätälöintiä', variant: 'primary', icon: '⚙', cellClass: 'bg-primary-500/10' },
};

const integrationNodes = [
  { id: 'odoo',     label: 'Odoo ERP',       x: 350, y: 20,  color: '#7B2D8E', w: 120, h: 40 },
  { id: 'fastems',  label: 'FASTEMS MMS',    x: 80,  y: 140, color: '#F59E0B', w: 130, h: 40 },
  { id: 'meltio',   label: 'Meltio M600',    x: 280, y: 240, color: '#3B82F6', w: 110, h: 40 },
  { id: 'haas',     label: 'DNM 5700',       x: 430, y: 240, color: '#10B981', w: 100, h: 40 },
  { id: 'amr',      label: 'MiR250 AMR',     x: 590, y: 140, color: '#EC4899', w: 110, h: 40 },
  { id: 'edge',     label: 'Edge Computing', x: 350, y: 140, color: '#06B6D4', w: 120, h: 40 },
  { id: 'tsdb',     label: 'Time-series DB', x: 620, y: 240, color: '#6B7280', w: 120, h: 40 },
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

type SwotVariant = 'success' | 'danger' | 'info' | 'warning';
const swotQuadrants: { title: string; items: string[]; variant: SwotVariant; icon: string }[] = [
  { title: 'Vahvuudet',      items: swotData.strengths,    variant: 'success', icon: '💪' },
  { title: 'Heikkoudet',     items: swotData.weaknesses,   variant: 'danger',  icon: '⚠️' },
  { title: 'Mahdollisuudet', items: swotData.opportunities, variant: 'info',   icon: '🚀' },
  { title: 'Uhat',           items: swotData.threats,       variant: 'warning', icon: '🔴' },
];

const variantBg: Record<SwotVariant, string> = {
  success: 'bg-success/5 border-success/20',
  danger:  'bg-danger/5 border-danger/20',
  info:    'bg-info/5 border-info/20',
  warning: 'bg-warning/5 border-warning/20',
};
const variantText: Record<SwotVariant, string> = {
  success: 'text-success', danger: 'text-danger', info: 'text-info', warning: 'text-warning',
};

export default function OdooERP() {
  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Odoo ERP – FieldLab-soveltuvuusselvitys</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5">Moduulikohtainen soveltuvuusmatriisi, SWOT-analyysi ja integraatioarkkitehtuuri</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <Badge key={key} variant={cfg.variant}>{cfg.icon} {cfg.label}</Badge>
        ))}
      </div>

      {/* Matrix */}
      <Card title="Soveltuvuusmatriisi: Odoo-moduulit × FieldLab-vaatimukset" accent>
        <div className="overflow-x-auto">
          <table className="text-xs w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="text-left py-2 pr-4 text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider w-44">Moduuli</th>
                {fieldlabRequirements.map((req) => (
                  <th key={req} className="text-center py-2 px-1 text-neutral-500 dark:text-neutral-400 font-semibold" style={{ minWidth: 80 }}>
                    <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 90, textAlign: 'left', fontSize: 10 }}>
                      {req}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {odooModules.map((mod) => (
                <tr key={mod} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                  <td className="py-2 pr-4 text-neutral-900 dark:text-neutral-100 font-medium text-xs">{mod}</td>
                  {fieldlabRequirements.map((req) => {
                    const status = (odooMatrix[mod]?.[req] ?? 'no') as Status;
                    const cfg = statusConfig[status];
                    return (
                      <td key={req} className={`p-1.5 text-center ${cfg.cellClass}`}>
                        <span
                          className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold"
                          title={cfg.label}
                        >
                          <Badge variant={cfg.variant} size="sm">{cfg.icon}</Badge>
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* SWOT */}
      <Card title="SWOT-analyysi: Odoo vs. FieldLab HMLV" accent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {swotQuadrants.map((q) => (
            <div key={q.title} className={`rounded-xl border p-4 ${variantBg[q.variant]}`}>
              <h3 className={`font-bold text-sm mb-2 ${variantText[q.variant]}`}>{q.icon} {q.title}</h3>
              <ul className="space-y-1.5">
                {q.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                    <span className="mt-0.5 shrink-0 text-neutral-400">▸</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      {/* Integration diagram */}
      <Card title="Integraatioarkkitehtuurikaavio" accent>
        <div className="overflow-x-auto">
          <svg width={760} height={310} className="bg-neutral-50 dark:bg-neutral-950 rounded-lg w-full">
            <defs>
              <marker id="arr2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#ADB5BD" />
              </marker>
            </defs>
            {integrationEdges.map((e, i) => {
              const from = getCenter(e.from);
              const to = getCenter(e.to);
              const mx = (from.x + to.x) / 2;
              const my = (from.y + to.y) / 2;
              return (
                <g key={i}>
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke="#ADB5BD" strokeWidth="1.5" strokeDasharray={e.dashed ? '4,3' : 'none'} markerEnd="url(#arr2)" />
                  <text x={mx} y={my - 4} fill="#6C757D" fontSize="8" textAnchor="middle">{e.label}</text>
                </g>
              );
            })}
            {integrationNodes.map((n) => (
              <g key={n.id}>
                <rect x={n.x} y={n.y} width={n.w} height={n.h} fill={n.color} fillOpacity={0.15} stroke={n.color} strokeWidth={1.5} rx={6} />
                <text x={n.x + n.w / 2} y={n.y + n.h / 2 + 4} fill={n.color} fontSize="11" fontWeight="600" textAnchor="middle">{n.label}</text>
              </g>
            ))}
          </svg>
        </div>
      </Card>

      {/* Recommendation */}
      <Card title="Yhteenveto ja suositus" accent>
        <div className="space-y-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            <span className="text-warning font-semibold">Suositus:</span>{' '}
            Odoo soveltuu TAMK FieldLabin ERP-alustaksi <span className="text-success font-medium">osittain</span>.
            Manufacturing MRP, Inventory ja Purchase -moduulit kattavat perusvalmistuksen ohjauksen hyvin.
            FASTEMS MMS -integraatio ja hienokuormitus vaativat räätälöintiä tai lisämoduulin (pl. Odoo 17 MES).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: 'Vaihe 1 (0–6 kk)', desc: 'Manufacturing + Inventory + PLM käyttöönotto. BOM-rakenteiden vienti Odoo-muotoon.', variant: 'success' as const },
              { label: 'Vaihe 2 (6–12 kk)', desc: 'REST API -silta FASTEMS MMS:ään. Quality-moduuli DED-laadunvalvontaan.', variant: 'warning' as const },
              { label: 'Vaihe 3 (12–18 kk)', desc: 'IoT Edge → OPC-UA → Odoo MES. Hienokuormituslogiikan räätälöinti HMLV-tarpeeseen.', variant: 'info' as const },
            ].map((phase) => (
              <div key={phase.label} className={`border rounded-xl p-3 ${variantBg[phase.variant]}`}>
                <div className={`font-semibold text-xs mb-1 ${variantText[phase.variant]}`}>{phase.label}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">{phase.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
