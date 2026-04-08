import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { calculateInvestment, formatCurrency, formatNumber } from '../../utils/calculations';
import type { Investment } from '../../types';
import { Card, Modal, Button, Badge, Slider, Input } from '../ui';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';
import { chartColors } from '../../styles/chartTheme';

const emptyInvestment: Omit<Investment, 'id'> = {
  name: '',
  shortName: '',
  cost: 0,
  annualSavings: 0,
  annualMaintenanceCost: 0,
  lifespan: 10,
  description: '',
  color: '#7B2D8E',
};

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

  const bestId = calcs.length > 0
    ? calcs.reduce((b, c) => c.calc.npv > b.calc.npv ? c : b).inv.id
    : null;

const openEdit = (inv: Investment) => { setForm({ ...inv }); setEditId(inv.id); setShowForm(true); };
  const openNew  = () => { setForm({ ...emptyInvestment, color: chartColors[investments.length % chartColors.length] }); setEditId(null); setShowForm(true); };

  const saveForm = () => {
    if (editId) setInvestments(investments.map((i) => (i.id === editId ? { id: editId, ...form } : i)));
    else setInvestments([...investments, { id: `inv-${Date.now()}`, ...form }]);
    setShowForm(false);
  };

  const deleteInv = (id: string) => setInvestments(investments.filter((i) => i.id !== id));

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Investointilaskin</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5">NPV, IRR, ROI ja takaisinmaksuaika – herkkyysanalyysi</p>
        </div>
        <Button onClick={openNew} icon={<PlusCircle size={16} />}>Lisää investointi</Button>
      </div>

      {/* Settings */}
      <Card title="Laskenta-asetukset" accent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Slider label="Diskonttokorko" min={0} max={15} step={0.5} value={discountRate} onChange={setDiscountRate} unit="%" />
          <Slider label="Vuosisäästön herkkyys" min={-30} max={30} step={5} value={sensitivity.savings}
            onChange={(v) => setSensitivity((s) => ({ ...s, savings: v }))} unit="%" />
          <Slider label="Hankintahinnan muutos" min={-20} max={40} step={5} value={sensitivity.cost}
            onChange={(v) => setSensitivity((s) => ({ ...s, cost: v }))} unit="%" />
        </div>
      </Card>

      {/* Comparison table */}
      <Card title="Vertailutaulukko" accent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400">
                {['Investointi', 'Hankinta', 'Vuosi CF', 'Takaisinmaksu', 'ROI', 'NPV', 'IRR', ''].map((h) => (
                  <th key={h} className={`py-2.5 px-2 font-semibold uppercase tracking-wider ${h === '' || h === 'Hankinta' || h === 'Vuosi CF' || h === 'Takaisinmaksu' || h === 'ROI' || h === 'NPV' || h === 'IRR' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calcs.map(({ inv, calc }) => (
                <tr key={inv.id} className={`border-b border-neutral-100 dark:border-neutral-800 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50 ${inv.id === bestId ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: inv.color }} />
                      <span className="text-neutral-900 dark:text-neutral-100 font-medium">{inv.shortName}</span>
                      {inv.id === bestId && <Badge variant="primary" size="sm">Paras</Badge>}
                    </div>
                    <div className="text-neutral-400 text-xs mt-0.5 pl-4">{inv.description.slice(0, 45)}{inv.description.length > 45 ? '…' : ''}</div>
                  </td>
                  <td className="py-2 px-2 text-right text-neutral-600 dark:text-neutral-300">{formatCurrency(inv.cost)}</td>
                  <td className="py-2 px-2 text-right text-neutral-600 dark:text-neutral-300">{formatCurrency(calc.annualNetCashFlow)}</td>
                  <td className="py-2 px-2 text-right text-neutral-600 dark:text-neutral-300">
                    {calc.paybackPeriod === Infinity ? '∞' : formatNumber(calc.paybackPeriod)} v
                  </td>
                  <td className={`py-2 px-2 text-right font-semibold ${calc.roi > 0 ? 'text-success' : 'text-danger'}`}>
                    {formatNumber(calc.roi, 0)} %
                  </td>
                  <td className={`py-2 px-2 text-right font-semibold ${calc.npv > 0 ? 'text-success' : 'text-danger'}`}>
                    {formatCurrency(calc.npv)}
                  </td>
                  <td className={`py-2 px-2 text-right font-semibold ${calc.irr > discountRate ? 'text-success' : 'text-warning'}`}>
                    {formatNumber(calc.irr, 1)} %
                  </td>
                  <td className="py-2 px-2 text-right">
                    <button onClick={() => openEdit(inv)} className="p-1 text-neutral-400 hover:text-primary-500 transition-colors mr-1"><Edit2 size={13} /></button>
                    <button onClick={() => deleteInv(inv.id)} className="p-1 text-neutral-400 hover:text-danger transition-colors"><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>


      {/* Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'Muokkaa investointia' : 'Lisää investointi'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Nimi" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <Input label="Lyhyt nimi" value={form.shortName} onChange={(e) => setForm((f) => ({ ...f, shortName: e.target.value }))} />
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Väri</label>
            <input type="color" className="w-full h-9 rounded-lg border border-neutral-300 dark:border-neutral-600 cursor-pointer bg-neutral-50 dark:bg-neutral-900 px-1"
              value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} />
          </div>
          <Input label="Hankintakustannus (€)" type="number" value={String(form.cost)} onChange={(e) => setForm((f) => ({ ...f, cost: Number(e.target.value) }))} />
          <Input label="Vuotuinen säästö (€)" type="number" value={String(form.annualSavings)} onChange={(e) => setForm((f) => ({ ...f, annualSavings: Number(e.target.value) }))} />
          <Input label="Ylläpito/vuosi (€)" type="number" value={String(form.annualMaintenanceCost)} onChange={(e) => setForm((f) => ({ ...f, annualMaintenanceCost: Number(e.target.value) }))} />
          <Input label="Käyttöikä (vuotta)" type="number" value={String(form.lifespan)} onChange={(e) => setForm((f) => ({ ...f, lifespan: Number(e.target.value) }))} />
          <div className="col-span-2">
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Kuvaus</label>
            <textarea
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-4">
          <Button variant="secondary" onClick={() => setShowForm(false)}>Peruuta</Button>
          <Button onClick={saveForm}>Tallenna</Button>
        </div>
      </Modal>
    </div>
  );
}
