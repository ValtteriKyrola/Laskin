import { useState } from 'react';
import { PlusCircle, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button, Card } from '../ui';

// ── Types ────────────────────────────────────────────────────────────────────

interface CostRow {
  id: string;
  label: string;
  amount: number;
  note: string;
}

interface MachineItem {
  id: string;
  name: string;
  expanded: boolean;
  rows: CostRow[];
}

// ── Default data ──────────────────────────────────────────────────────────────

const DEFAULT_ROW_LABELS = [
  'Hankintahinta',
  'Kuljetus & rahti',
  'Asennus & käyttöönotto',
  'Sähkötyöt',
  'Koulutus',
  'Muut',
];

function newRow(label = ''): CostRow {
  return { id: `r-${Date.now()}-${Math.random()}`, label, amount: 0, note: '' };
}

function newMachine(name = ''): MachineItem {
  return {
    id: `m-${Date.now()}`,
    name,
    expanded: true,
    rows: DEFAULT_ROW_LABELS.map(newRow),
  };
}

const INITIAL_MACHINES: MachineItem[] = [
  { ...newMachine('DN Solutions DNM 5700'), id: 'm-1' },
  { ...newMachine('MiR250 AMR'), id: 'm-2' },
  { ...newMachine('UR10e Cobot'), id: 'm-3' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString('fi-FI', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';

function machineTotal(m: MachineItem) {
  return m.rows.reduce((s, r) => s + (r.amount || 0), 0);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function InvestmentCalculator() {
  const [machines, setMachines] = useState<MachineItem[]>(INITIAL_MACHINES);
  const [newName, setNewName] = useState('');

  const grandTotal = machines.reduce((s, m) => s + machineTotal(m), 0);

  // Machine-level helpers
  const toggleExpand = (mid: string) =>
    setMachines((ms) => ms.map((m) => m.id === mid ? { ...m, expanded: !m.expanded } : m));

  const updateMachineName = (mid: string, name: string) =>
    setMachines((ms) => ms.map((m) => m.id === mid ? { ...m, name } : m));

  const deleteMachine = (mid: string) =>
    setMachines((ms) => ms.filter((m) => m.id !== mid));

  const addMachine = () => {
    if (!newName.trim()) return;
    setMachines((ms) => [...ms, newMachine(newName.trim())]);
    setNewName('');
  };

  // Row-level helpers
  const updateRow = (mid: string, rid: string, patch: Partial<CostRow>) =>
    setMachines((ms) =>
      ms.map((m) =>
        m.id === mid
          ? { ...m, rows: m.rows.map((r) => (r.id === rid ? { ...r, ...patch } : r)) }
          : m
      )
    );

  const addRow = (mid: string) =>
    setMachines((ms) =>
      ms.map((m) => m.id === mid ? { ...m, rows: [...m.rows, newRow()] } : m)
    );

  const deleteRow = (mid: string, rid: string) =>
    setMachines((ms) =>
      ms.map((m) => m.id === mid ? { ...m, rows: m.rows.filter((r) => r.id !== rid) } : m)
    );

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-5xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Investointibudjetti</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5">
          Koneet ja laitteet · kustannukset eriteltynä
        </p>
      </div>

      {/* Machine cards */}
      {machines.map((machine) => {
        const total = machineTotal(machine);
        return (
          <Card key={machine.id} accent>
            {/* Machine header row */}
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => toggleExpand(machine.id)}
                className="text-neutral-400 hover:text-primary-500 transition-colors shrink-0"
              >
                {machine.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              <input
                className="flex-1 bg-transparent text-neutral-900 dark:text-neutral-100 font-semibold text-sm focus:outline-none border-b border-transparent focus:border-primary-500 transition-colors"
                value={machine.name}
                onChange={(e) => updateMachineName(machine.id, e.target.value)}
                placeholder="Koneen nimi"
              />

              <span className="text-sm font-bold font-mono text-primary-500 shrink-0 ml-2">
                {fmt(total)}
              </span>

              <button
                onClick={() => deleteMachine(machine.id)}
                className="p-1 text-neutral-300 hover:text-danger transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Cost rows */}
            {machine.expanded && (
              <div className="mt-3 space-y-1.5">
                <div className="grid grid-cols-12 gap-2 text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-semibold mb-1 px-1">
                  <span className="col-span-4">Erä</span>
                  <span className="col-span-3 text-right">Summa (€)</span>
                  <span className="col-span-4">Huomio</span>
                  <span className="col-span-1" />
                </div>

                {machine.rows.map((row) => (
                  <div key={row.id} className="grid grid-cols-12 gap-2 items-center group">
                    <input
                      className="col-span-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1.5 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-primary-500"
                      value={row.label}
                      onChange={(e) => updateRow(machine.id, row.id, { label: e.target.value })}
                      placeholder="Kustannuserä"
                    />
                    <input
                      type="number"
                      className="col-span-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1.5 text-sm text-right font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-primary-500"
                      value={row.amount || ''}
                      onChange={(e) => updateRow(machine.id, row.id, { amount: Number(e.target.value) })}
                      placeholder="0"
                    />
                    <input
                      className="col-span-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1.5 text-sm text-neutral-500 dark:text-neutral-400 focus:outline-none focus:border-primary-500"
                      value={row.note}
                      onChange={(e) => updateRow(machine.id, row.id, { note: e.target.value })}
                      placeholder="Lisätieto..."
                    />
                    <button
                      onClick={() => deleteRow(machine.id, row.id)}
                      className="col-span-1 flex justify-center p-1 text-neutral-200 dark:text-neutral-700 hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}

                {/* Subtotal + add row */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 mt-2">
                  <button
                    onClick={() => addRow(machine.id)}
                    className="text-xs text-primary-500 hover:text-primary-400 flex items-center gap-1 transition-colors"
                  >
                    <PlusCircle size={13} /> Lisää rivi
                  </button>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    Yhteensä: <span className="font-bold font-mono text-neutral-900 dark:text-neutral-100">{fmt(total)}</span>
                  </span>
                </div>
              </div>
            )}
          </Card>
        );
      })}

      {/* Add machine */}
      <div className="flex gap-2">
        <input
          className="flex-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addMachine()}
          placeholder="Uuden koneen / laitteen nimi..."
        />
        <Button onClick={addMachine} icon={<PlusCircle size={15} />}>Lisää kone</Button>
      </div>

      {/* Grand total */}
      <div className="bg-primary-600 dark:bg-primary-700 rounded-2xl p-4 flex items-center justify-between">
        <span className="text-white font-semibold">Kokonaisbudjetti</span>
        <span className="text-white text-2xl font-bold font-mono">{fmt(grandTotal)}</span>
      </div>

    </div>
  );
}
