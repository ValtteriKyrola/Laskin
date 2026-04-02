import { useState } from 'react';
import {
  BarChart, Bar, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useStore } from '../../store/useStore';
import { calculateInvestment, formatCurrency, formatNumber } from '../../utils/calculations';
import type { Investment } from '../../types';
import Card from '../shared/Card';

const emptyInvestment: Omit<Investment, 'id'> = {
  name: '',
  shortName: '',
  cost: 0,
  annualSavings: 0,
  annualMaintenanceCost: 0,
  lifespan: 10,
  description: '',
  color: '#3b82f6',
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function InvestmentCalculator() {
  const { investments, setInvestments, discountRate, setDiscountRate } = useStore();
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Investment, 'id'>>(emptyInvestment);
  const [showForm, setShowForm] = useState(false);
  const [sensitivity, setSensitivity] = useState({ savings: 0, cost: 0 });

  const calcs = investments.map((inv) => {
    const adj: Investment = {
      ...inv,
      annualSavings: inv.annualSavings * (1 + sensitivity.savings / 100),
      cost: inv.cost * (1 + sensitivity.cost / 100),
    };
    return { inv, calc: calculateInvestment(adj, discountRate) };
  });

  const cashflowData = Array.from({ length: 11 }, (_, yr) => {
    const d: Record<string, number | string> = { year: `v${yr}` };
    calcs.forEach(({ inv, calc }) => {
      if (yr === 0) d[inv.shortName] = -inv.cost;
      else d[inv.shortName] = Math.round(-inv.cost + calc.annualNetCashFlow * yr);
    });
    return d;
  });

  const openEdit = (inv: Investment) => {
    setForm({ ...inv });
    setEditId(inv.id);
    setShowForm(true);
  };

  const openNew = () => {
    setForm({ ...emptyInvestment, color: COLORS[investments.length % COLORS.length] });
    setEditId(null);
    setShowForm(true);
  };

  const saveForm = () => {
    if (editId) {
      setInvestments(investments.map((i) => (i.id === editId ? { id: editId, ...form } : i)));
    } else {
      setInvestments([...investments, { id: `inv-${Date.now()}`, ...form }]);
    }
    setShowForm(false);
  };

  const deleteInv = (id: string) => {
    setInvestments(investments.filter((i) => i.id !== id));
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Investointilaskin</h1>
          <p className="text-gray-400 text-xs mt-0.5">NPV, IRR, ROI ja takaisinmaksuaika – herkkyysanalyysi</p>
        </div>
        <button onClick={openNew} className="btn-primary">+ Lisää investointi</button>
      </div>

      {/* Global settings */}
      <Card title="Laskenta-asetukset">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Diskonttokorko: {discountRate} %</label>
            <input type="range" min={0} max={15} step={0.5} value={discountRate}
              onChange={(e) => setDiscountRate(Number(e.target.value))}
              className="w-full" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">
              Vuosisäästön herkkyys: {sensitivity.savings >= 0 ? '+' : ''}{sensitivity.savings} %
            </label>
            <input type="range" min={-30} max={30} step={5} value={sensitivity.savings}
              onChange={(e) => setSensitivity((s) => ({ ...s, savings: Number(e.target.value) }))}
              className="w-full" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">
              Hankintahinnan muutos: {sensitivity.cost >= 0 ? '+' : ''}{sensitivity.cost} %
            </label>
            <input type="range" min={-20} max={40} step={5} value={sensitivity.cost}
              onChange={(e) => setSensitivity((s) => ({ ...s, cost: Number(e.target.value) }))}
              className="w-full" />
          </div>
        </div>
      </Card>

      {/* Comparison table */}
      <Card title="Vertailutaulukko">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="text-left py-2">Investointi</th>
                <th className="text-right py-2">Hankinta</th>
                <th className="text-right py-2">Vuosi CF</th>
                <th className="text-right py-2">Takaisinmaksu</th>
                <th className="text-right py-2">ROI</th>
                <th className="text-right py-2">NPV</th>
                <th className="text-right py-2">IRR</th>
                <th className="text-right py-2"></th>
              </tr>
            </thead>
            <tbody>
              {calcs.map(({ inv, calc }) => (
                <tr key={inv.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: inv.color }} />
                      <span className="text-gray-100 font-medium">{inv.shortName}</span>
                    </div>
                    <div className="text-gray-500 text-xs mt-0.5 pl-4.5">{inv.description.slice(0, 50)}…</div>
                  </td>
                  <td className="py-2 text-right text-gray-300">{formatCurrency(inv.cost)}</td>
                  <td className="py-2 text-right text-gray-300">{formatCurrency(calc.annualNetCashFlow)}</td>
                  <td className="py-2 text-right text-gray-300">{formatNumber(calc.paybackPeriod)} v</td>
                  <td className={`py-2 text-right font-semibold ${calc.roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatNumber(calc.roi, 0)} %
                  </td>
                  <td className={`py-2 text-right font-semibold ${calc.npv > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(calc.npv)}
                  </td>
                  <td className={`py-2 text-right font-semibold ${calc.irr > discountRate ? 'text-green-400' : 'text-yellow-400'}`}>
                    {formatNumber(calc.irr, 1)} %
                  </td>
                  <td className="py-2 text-right">
                    <button onClick={() => openEdit(inv)} className="text-yellow-400 hover:text-yellow-300 mr-2 text-xs">✎</button>
                    <button onClick={() => deleteInv(inv.id)} className="text-red-400 hover:text-red-300 text-xs">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="NPV-vertailu (€)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={calcs.map(({ inv, calc }) => ({ name: inv.shortName, NPV: Math.round(calc.npv), color: inv.color }))}
              margin={{ top: 15, right: 10, bottom: 5, left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                formatter={(v: unknown) => [formatCurrency(v as number), 'NPV']}
              />
              <ReferenceLine y={0} stroke="#4b5563" />
              <Bar dataKey="NPV" radius={[4, 4, 0, 0]}>
                {calcs.map(({ inv }) => (
                  <Cell key={inv.id} fill={inv.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Kumulatiivinen kassavirta (€)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={cashflowData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                formatter={(v: unknown) => formatCurrency(v as number)} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <ReferenceLine y={0} stroke="#4b5563" strokeDasharray="4 2" />
              {investments.map((inv) => (
                <Line key={inv.id} type="monotone" dataKey={inv.shortName}
                  stroke={inv.color} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Edit/Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg space-y-3">
            <h2 className="text-white font-bold text-lg">
              {editId ? 'Muokkaa investointia' : 'Lisää investointi'}
            </h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2">
                <label className="text-gray-400 text-xs block mb-1">Nimi</label>
                <input className="input" value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Lyhyt nimi</label>
                <input className="input" value={form.shortName}
                  onChange={(e) => setForm((f) => ({ ...f, shortName: e.target.value }))} />
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Väri</label>
                <input type="color" className="w-full h-9 rounded bg-gray-800 border border-gray-700 cursor-pointer"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} />
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Hankintakustannus (€)</label>
                <input type="number" className="input" value={form.cost}
                  onChange={(e) => setForm((f) => ({ ...f, cost: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Vuotuinen säästö (€)</label>
                <input type="number" className="input" value={form.annualSavings}
                  onChange={(e) => setForm((f) => ({ ...f, annualSavings: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Ylläpito/vuosi (€)</label>
                <input type="number" className="input" value={form.annualMaintenanceCost}
                  onChange={(e) => setForm((f) => ({ ...f, annualMaintenanceCost: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Käyttöikä (vuotta)</label>
                <input type="number" className="input" value={form.lifespan}
                  onChange={(e) => setForm((f) => ({ ...f, lifespan: Number(e.target.value) }))} />
              </div>
              <div className="col-span-2">
                <label className="text-gray-400 text-xs block mb-1">Kuvaus</label>
                <textarea className="input" rows={2} value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Peruuta</button>
              <button onClick={saveForm} className="btn-primary">Tallenna</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
