import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { Card, Badge } from '../ui';
import { sensorDataTable } from '../../data/defaults';
import { generateSPCData } from '../../utils/calculations';
import { useTheme } from '../../hooks/useTheme';

const archNodes = [
  { id: 'sensors',   label: 'Anturit & laitteet', sublabel: 'Meltio, DNM 5700, AMR, mittaus',   x: 30,  y: 100, w: 140, h: 50, color: '#3B82F6' },
  { id: 'opcua',     label: 'OPC-UA / MQTT',       sublabel: 'Protokollamuunnos',            x: 230, y: 100, w: 130, h: 50, color: '#06B6D4' },
  { id: 'edge',      label: 'Edge Computing',       sublabel: 'Raspberry Pi / IPC',           x: 420, y: 100, w: 130, h: 50, color: '#7B2D8E' },
  { id: 'tsdb',      label: 'Time-series DB',       sublabel: 'InfluxDB / TimescaleDB',       x: 610, y: 60,  w: 140, h: 50, color: '#10B981' },
  { id: 'odoo',      label: 'Odoo ERP',             sublabel: 'Tuotannonohjaus',              x: 610, y: 140, w: 140, h: 50, color: '#F59E0B' },
  { id: 'dashboard', label: 'Dashboard / SPC',      sublabel: 'Grafana / React',              x: 810, y: 100, w: 130, h: 50, color: '#EC4899' },
];

const archEdges = [
  { from: 'sensors', to: 'opcua',     label: '100Hz–1kHz' },
  { from: 'opcua',   to: 'edge',      label: 'JSON/Protobuf' },
  { from: 'edge',    to: 'tsdb',      label: 'Tallennus' },
  { from: 'edge',    to: 'odoo',      label: 'REST API' },
  { from: 'tsdb',    to: 'dashboard', label: 'Query' },
  { from: 'odoo',    to: 'dashboard', label: 'KPI-data' },
];

function getCenter(id: string) {
  const n = archNodes.find((n) => n.id === id);
  if (!n) return { x: 0, y: 0 };
  return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
}

const qualitySteps = [
  { step: '1', label: 'DED-tulostus',         desc: 'Meltio Engine Robot prosessin seuranta: laserteho, lämpötila, langansyöttö' },
  { step: '2', label: 'Jäähtyminen',           desc: 'Jäähtymisnopeuden ohjaus, hapetuksen esto suojakaasulla' },
  { step: '3', label: 'Visuaalinen tarkastus', desc: 'Kamerajärjestelmä pinnan laadun tarkastukseen' },
  { step: '4', label: 'CMM-mittaus',           desc: 'Koordinaattimittaus: geometria, toleranssit ±0.1mm' },
  { step: '5', label: 'Pinnankarheuden mittaus', desc: 'Ra-arvo tarkastus (tavoite Ra ≤ 6.3µm ennen jälkikäsittelyä)' },
  { step: '6', label: 'Koneistus (DNM 5700)', desc: 'Viimeistelevä koneistus toleransseihin IT7–IT8' },
  { step: '7', label: 'Loppumittaus',          desc: 'CMM + pinnankarheus. SPC-seuranta – hyväksyntä/hylkäys' },
  { step: '8', label: 'Hyväksyntä / arkistointi', desc: 'Mittauspöytäkirja Odoo Quality → jäljitettävyys' },
];

const gridStroke = (dark: boolean) => dark ? '#343A40' : '#E9ECEF';
const tickFill   = (dark: boolean) => dark ? '#ADB5BD' : '#6C757D';
const tooltipStyle = (dark: boolean) => ({
  background: dark ? '#212529' : '#fff',
  border: `1px solid ${dark ? '#343A40' : '#DEE2E6'}`,
  borderRadius: 8, fontSize: 11,
  color: dark ? '#F8F9FA' : '#212529',
});

export default function DataQuality() {
  const { isDark } = useTheme();
  const spcData = useMemo(() => generateSPCData(25), []);
  const outOfControlX = spcData.xbar.filter((p) => p.value > p.ucl || p.value < p.lcl);
  const outOfControlR = spcData.rChart.filter((p) => p.value > p.ucl);
  const machines = Array.from(new Set(sensorDataTable.map((s) => s.machine)));

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Datan keruu & laadunvarmistus</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5">Datankeruuarkkitehtuuri, SPC-valvontakortit ja laadunvarmistusprosessi</p>
      </div>

      {/* Architecture */}
      <Card title="Datankeruuarkkitehtuuri" accent>
        <div className="overflow-x-auto">
          <svg width={980} height={220} className="bg-neutral-50 dark:bg-neutral-950 rounded-lg w-full">
            <defs>
              <marker id="arrd" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#ADB5BD" />
              </marker>
            </defs>
            {archEdges.map((e, i) => {
              const from = getCenter(e.from);
              const to = getCenter(e.to);
              return (
                <g key={i}>
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#ADB5BD" strokeWidth="1.5" markerEnd="url(#arrd)" />
                  <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 8} fill="#6C757D" fontSize="8" textAnchor="middle">{e.label}</text>
                </g>
              );
            })}
            {archNodes.map((n) => (
              <g key={n.id}>
                <rect x={n.x} y={n.y} width={n.w} height={n.h} fill={n.color} fillOpacity={0.12} stroke={n.color} strokeWidth={1.5} rx={6} />
                <text x={n.x + n.w / 2} y={n.y + n.h / 2 - 4} fill={n.color} fontSize="11" fontWeight="600" textAnchor="middle">{n.label}</text>
                <text x={n.x + n.w / 2} y={n.y + n.h / 2 + 10} fill="#6C757D" fontSize="8" textAnchor="middle">{n.sublabel}</text>
              </g>
            ))}
          </svg>
        </div>
      </Card>

      {/* Sensor table */}
      <Card title="Kerättävä data – kone, parametri, taajuus" accent>
        <div className="space-y-4">
          {machines.map((machine) => (
            <div key={machine}>
              <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">{machine}</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500">
                      {['Parametri', 'Yksikkö', 'Näytteenottotaajuus', 'Käyttötarkoitus'].map((h) => (
                        <th key={h} className="text-left py-1.5 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sensorDataTable.filter((s) => s.machine === machine).map((s, i) => (
                      <tr key={i} className="border-b border-neutral-100 dark:border-neutral-800/40 hover:bg-neutral-50 dark:hover:bg-neutral-800/20 transition-colors">
                        <td className="py-1.5 text-neutral-800 dark:text-neutral-200">{s.parameter}</td>
                        <td className="py-1.5 text-neutral-500 dark:text-neutral-400 font-mono">{s.unit}</td>
                        <td className="py-1.5 text-info">{s.frequency}</td>
                        <td className="py-1.5 text-neutral-500 dark:text-neutral-400">{s.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quality flow */}
      <Card title="DED-laadunvarmistusprosessi – vuokaavio" accent>
        <div className="space-y-0">
          {qualitySteps.map((step, i) => (
            <div key={step.step} className="flex items-start gap-3">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-xs font-bold text-white">
                  {step.step}
                </div>
                {i < qualitySteps.length - 1 && (
                  <div className="w-0.5 h-5 bg-neutral-200 dark:bg-neutral-700 mt-1" />
                )}
              </div>
              <div className="pb-3 flex-1">
                <div className="text-neutral-900 dark:text-neutral-100 font-semibold text-sm">{step.label}</div>
                <div className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5">{step.desc}</div>
              </div>
            </div>
          ))}
          <div className="flex gap-3 mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex-1 bg-success/10 border border-success/30 rounded-xl p-3 text-center">
              <div className="text-success font-bold text-sm">✓ Hyväksytty</div>
              <div className="text-xs text-neutral-500 mt-1">Mittauspöytäkirja → Odoo → toimitus</div>
            </div>
            <div className="flex-1 bg-danger/10 border border-danger/30 rounded-xl p-3 text-center">
              <div className="text-danger font-bold text-sm">✗ Hylätty</div>
              <div className="text-xs text-neutral-500 mt-1">Syyn analyysi → korjaava toimenpide → uusintatulostus</div>
            </div>
          </div>
        </div>
      </Card>

      {/* SPC Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card accent title={`X-bar -kortti${outOfControlX.length > 0 ? ` (${outOfControlX.length} yli rajojen)` : ' – hallinnassa'}`}>
          {outOfControlX.length > 0 && (
            <div className="mb-2 flex items-center gap-1.5">
              <Badge variant="danger">⚠ {outOfControlX.length} havainto UCL/LCL-rajojen ulkopuolella</Badge>
            </div>
          )}
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={spcData.xbar} margin={{ top: 5, right: 10, bottom: 5, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke(isDark)} />
              <XAxis dataKey="sample" tick={{ fill: tickFill(isDark), fontSize: 9 }} />
              <YAxis tick={{ fill: tickFill(isDark), fontSize: 9 }} domain={['auto', 'auto']} tickFormatter={(v) => v.toFixed(3)} />
              <Tooltip contentStyle={tooltipStyle(isDark)} formatter={(v: unknown) => [(v as number).toFixed(4) + ' mm', '']} />
              <ReferenceLine y={spcData.xbar[0]?.ucl} stroke="#EF4444" strokeDasharray="4,2" label={{ value: 'UCL', fill: '#EF4444', fontSize: 9 }} />
              <ReferenceLine y={spcData.xbar[0]?.lcl} stroke="#EF4444" strokeDasharray="4,2" label={{ value: 'LCL', fill: '#EF4444', fontSize: 9 }} />
              <ReferenceLine y={spcData.xbar[0]?.cl} stroke="#10B981" strokeDasharray="4,2" label={{ value: 'CL', fill: '#10B981', fontSize: 9 }} />
              <Line type="monotone" dataKey="value" stroke="#7B2D8E" strokeWidth={1.5} dot={(props) => {
                const { cx, cy, payload } = props;
                const oc = payload.value > payload.ucl || payload.value < payload.lcl;
                return <circle key={`x-${payload.sample}`} cx={cx} cy={cy} r={oc ? 4 : 2} fill={oc ? '#EF4444' : '#7B2D8E'} />;
              }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card accent title={`R-kortti${outOfControlR.length > 0 ? ` (${outOfControlR.length} yli UCL)` : ' – hallinnassa'}`}>
          {outOfControlR.length > 0 && (
            <div className="mb-2 flex items-center gap-1.5">
              <Badge variant="danger">⚠ Vaihtelevuus kasvanut</Badge>
            </div>
          )}
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={spcData.rChart} margin={{ top: 5, right: 10, bottom: 5, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke(isDark)} />
              <XAxis dataKey="sample" tick={{ fill: tickFill(isDark), fontSize: 9 }} />
              <YAxis tick={{ fill: tickFill(isDark), fontSize: 9 }} domain={[0, 'auto']} tickFormatter={(v) => v.toFixed(3)} />
              <Tooltip contentStyle={tooltipStyle(isDark)} formatter={(v: unknown) => [(v as number).toFixed(4) + ' mm', '']} />
              <ReferenceLine y={spcData.rChart[0]?.ucl} stroke="#EF4444" strokeDasharray="4,2" label={{ value: 'UCL', fill: '#EF4444', fontSize: 9 }} />
              <ReferenceLine y={spcData.rChart[0]?.cl} stroke="#10B981" strokeDasharray="4,2" label={{ value: 'R̄', fill: '#10B981', fontSize: 9 }} />
              <Line type="monotone" dataKey="value" stroke="#7B2D8E" strokeWidth={1.5} dot={(props) => {
                const { cx, cy, payload } = props;
                const oc = payload.value > payload.ucl;
                return <circle key={`r-${payload.sample}`} cx={cx} cy={cy} r={oc ? 4 : 2} fill={oc ? '#EF4444' : '#7B2D8E'} />;
              }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* SPC params */}
      <Card title="SPC-parametrit (simuloitu: DNM 5700, reikähalkaisija ⌀100.000 mm)" accent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          {[
            { label: 'Kohdemitto', value: '100.000 mm', color: 'text-neutral-900 dark:text-neutral-100' },
            { label: 'Prosessistandardi σ', value: '0.020 mm', color: 'text-info' },
            { label: 'Alaryhmäkoko n', value: '5', color: 'text-success' },
            { label: 'Näytteitä', value: '25', color: 'text-primary-500' },
          ].map((s) => (
            <div key={s.label} className="bg-neutral-100 dark:bg-neutral-900 rounded-xl p-3">
              <div className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-xs text-neutral-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
