import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import Card from '../shared/Card';
import { sensorDataTable } from '../../data/defaults';
import { generateSPCData } from '../../utils/calculations';

const archNodes = [
  { id: 'sensors', label: 'Anturit & laitteet', sublabel: 'Meltio, Haas, AMR, mittaus', x: 30, y: 100, w: 140, h: 50, color: '#3b82f6' },
  { id: 'opcua', label: 'OPC-UA / MQTT', sublabel: 'Protokollamuunnos', x: 230, y: 100, w: 130, h: 50, color: '#06b6d4' },
  { id: 'edge', label: 'Edge Computing', sublabel: 'Raspberry Pi / IPC', x: 420, y: 100, w: 130, h: 50, color: '#8b5cf6' },
  { id: 'tsdb', label: 'Time-series DB', sublabel: 'InfluxDB / TimescaleDB', x: 610, y: 60, w: 140, h: 50, color: '#10b981' },
  { id: 'odoo', label: 'Odoo ERP', sublabel: 'Tuotannonohjaus', x: 610, y: 140, w: 140, h: 50, color: '#f59e0b' },
  { id: 'dashboard', label: 'Dashboard / SPC', sublabel: 'Grafana / React', x: 810, y: 100, w: 130, h: 50, color: '#ec4899' },
];

const archEdges = [
  { from: 'sensors', to: 'opcua', label: '100Hz–1kHz' },
  { from: 'opcua', to: 'edge', label: 'JSON/Protobuf' },
  { from: 'edge', to: 'tsdb', label: 'Tallennus' },
  { from: 'edge', to: 'odoo', label: 'REST API' },
  { from: 'tsdb', to: 'dashboard', label: 'Query' },
  { from: 'odoo', to: 'dashboard', label: 'KPI-data' },
];

function getCenter(id: string) {
  const n = archNodes.find((n) => n.id === id);
  if (!n) return { x: 0, y: 0 };
  return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
}

const qualitySteps = [
  { step: '1', label: 'DED-tulostus', desc: 'Meltio M600 prosessin seuranta: laserteho, lämpötila, langansyöttö', color: '#3b82f6' },
  { step: '2', label: 'Jäähtyminen', desc: 'Jäähtymisnopeuden ohjaus, hapetuksen esto suojakaasulla', color: '#6366f1' },
  { step: '3', label: 'Visuaalinen tarkastus', desc: 'Kamerajärjestelmä pinnan laadun tarkastukseen', color: '#8b5cf6' },
  { step: '4', label: 'CMM-mittaus', desc: 'Koordinaattimittaus: geometria, toleranssit ±0.1mm', color: '#a855f7' },
  { step: '5', label: 'Pinnankarheuden mittaus', desc: 'Ra-arvo tarkastus (tavoite Ra ≤ 6.3µm ennen jälkikäsittelyä)', color: '#c084fc' },
  { step: '6', label: 'Koneistus (Haas VF-2)', desc: 'Viimeistelevä koneistus toleransseihin IT7–IT8', color: '#10b981' },
  { step: '7', label: 'Loppumittaus', desc: 'CMM + pinnankarheus. SPC-seuranta – hyväksyntä/hylkäys', color: '#14b8a6' },
  { step: '8', label: 'Hyväksyntä / arkistointi', desc: 'Mittauspöytäkirja Odoo Quality → jäljitettävyys', color: '#06b6d4' },
];

export default function DataQuality() {
  const spcData = useMemo(() => generateSPCData(25), []);

  const outOfControlX = spcData.xbar.filter((p) => p.value > p.ucl || p.value < p.lcl);
  const outOfControlR = spcData.rChart.filter((p) => p.value > p.ucl);

  const machines = Array.from(new Set(sensorDataTable.map((s) => s.machine)));

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white">Datan keruu & laadunvarmistus</h1>
        <p className="text-gray-400 text-xs mt-0.5">Datankeruuarkkitehtuuri, SPC-valvontakortit ja laadunvarmistusprosessi</p>
      </div>

      {/* Architecture diagram */}
      <Card title="Datankeruuarkkitehtuuri">
        <div className="overflow-x-auto">
          <svg width={980} height={220} className="bg-gray-950 rounded-lg">
            <defs>
              <marker id="arrd" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#4b5563" />
              </marker>
            </defs>
            {archEdges.map((e, i) => {
              const from = getCenter(e.from);
              const to = getCenter(e.to);
              const mx = (from.x + to.x) / 2;
              const my = (from.y + to.y) / 2 - 8;
              return (
                <g key={i}>
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke="#374151" strokeWidth="1.5" markerEnd="url(#arrd)" />
                  <text x={mx} y={my} fill="#6b7280" fontSize="8" textAnchor="middle">{e.label}</text>
                </g>
              );
            })}
            {archNodes.map((n) => (
              <g key={n.id}>
                <rect x={n.x} y={n.y} width={n.w} height={n.h}
                  fill={n.color} fillOpacity={0.12} stroke={n.color} strokeWidth={1.5} rx={6} />
                <text x={n.x + n.w / 2} y={n.y + n.h / 2 - 4}
                  fill={n.color} fontSize="11" fontWeight="600" textAnchor="middle">{n.label}</text>
                <text x={n.x + n.w / 2} y={n.y + n.h / 2 + 10}
                  fill="#6b7280" fontSize="8" textAnchor="middle">{n.sublabel}</text>
              </g>
            ))}
          </svg>
        </div>
      </Card>

      {/* Sensor table */}
      <Card title="Kerättävä data – kone, parametri, taajuus">
        <div className="space-y-4">
          {machines.map((machine) => (
            <div key={machine}>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{machine}</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-500">
                      <th className="text-left py-1.5 font-normal">Parametri</th>
                      <th className="text-left py-1.5 font-normal">Yksikkö</th>
                      <th className="text-left py-1.5 font-normal">Näytteenottotaajuus</th>
                      <th className="text-left py-1.5 font-normal">Käyttötarkoitus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sensorDataTable.filter((s) => s.machine === machine).map((s, i) => (
                      <tr key={i} className="border-b border-gray-800/30 hover:bg-gray-800/20">
                        <td className="py-1.5 text-gray-200">{s.parameter}</td>
                        <td className="py-1.5 text-gray-400 font-mono">{s.unit}</td>
                        <td className="py-1.5 text-blue-400">{s.frequency}</td>
                        <td className="py-1.5 text-gray-400">{s.purpose}</td>
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
      <Card title="DED-laadunvarmistusprosessi – vuokaavio">
        <div className="relative">
          <div className="flex flex-col gap-0">
            {qualitySteps.map((step, i) => (
              <div key={step.step} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.step}
                  </div>
                  {i < qualitySteps.length - 1 && (
                    <div className="w-0.5 h-6 bg-gray-700 mt-1" />
                  )}
                </div>
                <div className="pb-4 flex-1">
                  <div className="text-white font-semibold text-sm">{step.label}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Decision diamonds */}
          <div className="mt-2 flex gap-3">
            <div className="flex-1 bg-green-900/20 border border-green-800 rounded-xl p-3 text-center">
              <div className="text-green-400 font-bold text-sm">✓ Hyväksytty</div>
              <div className="text-xs text-gray-400 mt-1">Mittauspöytäkirja → Odoo → toimitus</div>
            </div>
            <div className="flex-1 bg-red-900/20 border border-red-800 rounded-xl p-3 text-center">
              <div className="text-red-400 font-bold text-sm">✗ Hylätty</div>
              <div className="text-xs text-gray-400 mt-1">Syyn analyysi → korjaava toimenpide → uusintatulostus</div>
            </div>
          </div>
        </div>
      </Card>

      {/* SPC Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title={`X-bar -kortti (n=${outOfControlX.length > 0 ? `${outOfControlX.length} pistettä raja-arvojen ulkopuolella` : 'kaikki pisteet hallinnassa'})`}>
          {outOfControlX.length > 0 && (
            <div className="mb-2 text-xs text-red-400 bg-red-900/20 border border-red-800 rounded px-2 py-1">
              ⚠ {outOfControlX.length} havainto UCL/LCL-rajojen ulkopuolella – prosessi ei hallinnassa
            </div>
          )}
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={spcData.xbar} margin={{ top: 5, right: 10, bottom: 5, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="sample" tick={{ fill: '#6b7280', fontSize: 9 }} label={{ value: 'Näyte', position: 'insideBottom', fill: '#6b7280', fontSize: 10 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 9 }} domain={['auto', 'auto']}
                tickFormatter={(v) => v.toFixed(3)} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 11 }}
                formatter={(v: unknown) => [(v as number).toFixed(4) + ' mm', '']} />
              <ReferenceLine y={spcData.xbar[0]?.ucl} stroke="#ef4444" strokeDasharray="4,2" label={{ value: 'UCL', fill: '#ef4444', fontSize: 9 }} />
              <ReferenceLine y={spcData.xbar[0]?.lcl} stroke="#ef4444" strokeDasharray="4,2" label={{ value: 'LCL', fill: '#ef4444', fontSize: 9 }} />
              <ReferenceLine y={spcData.xbar[0]?.cl} stroke="#10b981" strokeDasharray="4,2" label={{ value: 'CL', fill: '#10b981', fontSize: 9 }} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={1.5} dot={(props) => {
                const { cx, cy, payload } = props;
                const oc = payload.value > payload.ucl || payload.value < payload.lcl;
                return <circle key={`dot-${payload.sample}`} cx={cx} cy={cy} r={oc ? 4 : 2} fill={oc ? '#ef4444' : '#3b82f6'} />;
              }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title={`R-kortti (${outOfControlR.length > 0 ? `${outOfControlR.length} yli UCL` : 'hallinnassa'})`}>
          {outOfControlR.length > 0 && (
            <div className="mb-2 text-xs text-red-400 bg-red-900/20 border border-red-800 rounded px-2 py-1">
              ⚠ Vaihtelevuus kasvanut – tarkista prosessi
            </div>
          )}
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={spcData.rChart} margin={{ top: 5, right: 10, bottom: 5, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="sample" tick={{ fill: '#6b7280', fontSize: 9 }} label={{ value: 'Näyte', position: 'insideBottom', fill: '#6b7280', fontSize: 10 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 9 }} domain={[0, 'auto']} tickFormatter={(v) => v.toFixed(3)} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 11 }}
                formatter={(v: unknown) => [(v as number).toFixed(4) + ' mm', '']} />
              <ReferenceLine y={spcData.rChart[0]?.ucl} stroke="#ef4444" strokeDasharray="4,2" label={{ value: 'UCL', fill: '#ef4444', fontSize: 9 }} />
              <ReferenceLine y={spcData.rChart[0]?.cl} stroke="#10b981" strokeDasharray="4,2" label={{ value: 'R̄', fill: '#10b981', fontSize: 9 }} />
              <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={1.5} dot={(props) => {
                const { cx, cy, payload } = props;
                const oc = payload.value > payload.ucl;
                return <circle key={`dot-${payload.sample}`} cx={cx} cy={cy} r={oc ? 4 : 2} fill={oc ? '#ef4444' : '#f59e0b'} />;
              }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* SPC info */}
      <Card title="SPC-parametrit (simuloitu: Haas VF-2, reikähalkaisija ⌀100.000 mm)">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          {[
            { label: 'Kohdemitto', value: '100.000 mm', color: 'text-white' },
            { label: 'Prosessistandardi σ', value: '0.020 mm', color: 'text-blue-400' },
            { label: 'Alaryhmäkoko n', value: '5', color: 'text-green-400' },
            { label: 'Näytteitä', value: '25', color: 'text-yellow-400' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-800 rounded-xl p-3">
              <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
