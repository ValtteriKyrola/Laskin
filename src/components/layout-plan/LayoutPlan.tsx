import { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import type { Machine, LayoutOption, MaterialFlow } from '../../types';
import { Card, Button, Select } from '../ui';
import { PlusCircle, Download, Trash2 } from 'lucide-react';

const GRID = 20;
const CANVAS_W = 800;
const CANVAS_H = 500;

const machineTemplates: Array<{ type: Machine['type']; label: string; color: string; w: number; h: number }> = [
  { type: 'meltio',           label: 'Meltio M600',    color: '#7B2D8E', w: 120, h: 100 },
  { type: 'abb-robot',        label: 'ABB IRB 2600',   color: '#3B82F6', w: 80,  h: 80  },
  { type: 'machining-center', label: 'Haas VF-2',      color: '#10B981', w: 110, h: 90  },
  { type: 'bridgeport',       label: 'Bridgeport',     color: '#14B8A6', w: 90,  h: 80  },
  { type: 'fastems',          label: 'FASTEMS MMS',    color: '#F59E0B', w: 150, h: 80  },
  { type: 'amr',              label: 'MiR250 AMR',     color: '#EC4899', w: 70,  h: 70  },
  { type: 'cobot',            label: 'UR10e Cobot',    color: '#8B5CF6', w: 70,  h: 70  },
  { type: 'measurement',      label: 'Mittausasema',   color: '#06B6D4', w: 90,  h: 70  },
  { type: 'storage',          label: 'Varasto',        color: '#6B7280', w: 100, h: 120 },
];

function snap(v: number) { return Math.round(v / GRID) * GRID; }
function getMachineCenter(m: Machine) { return { x: m.x + m.width / 2, y: m.y + m.height / 2 }; }

export default function LayoutPlan() {
  const { layouts, setLayouts, activeLayoutId, setActiveLayoutId } = useStore();
  const activeLayout = layouts.find((l) => l.id === activeLayoutId) || layouts[0];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const dragPos = useRef<{ id: string; x: number; y: number } | null>(null);
  const [showAddFlow, setShowAddFlow] = useState(false);
  const [flowFrom, setFlowFrom] = useState('');
  const [flowTo, setFlowTo] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);

  const updateLayout = useCallback((updated: LayoutOption) => {
    setLayouts(layouts.map((l) => (l.id === updated.id ? updated : l)));
  }, [layouts, setLayouts]);

  const addMachine = (tmpl: typeof machineTemplates[0]) => {
    const id = `m${Date.now()}`;
    const newMachine: Machine = { id, type: tmpl.type, name: tmpl.label, x: 80, y: 80, width: tmpl.w, height: tmpl.h, color: tmpl.color, rotation: 0 };
    updateLayout({ ...activeLayout, machines: [...activeLayout.machines, newMachine] });
  };

  const deleteMachine = (id: string) => {
    updateLayout({ ...activeLayout, machines: activeLayout.machines.filter((m) => m.id !== id), flows: activeLayout.flows.filter((f) => f.from !== id && f.to !== id) });
    setSelectedId(null);
  };

  const addFlow = () => {
    if (!flowFrom || !flowTo || flowFrom === flowTo) return;
    const newFlow: MaterialFlow = { id: `f${Date.now()}`, from: flowFrom, to: flowTo };
    updateLayout({ ...activeLayout, flows: [...activeLayout.flows, newFlow] });
    setShowAddFlow(false); setFlowFrom(''); setFlowTo('');
  };

  const addLayout = () => {
    const id = `layout-${Date.now()}`;
    const newLayout: LayoutOption = { id, name: `Layout ${String.fromCharCode(65 + layouts.length)}`, machines: [], flows: [], createdAt: new Date().toISOString() };
    setLayouts([...layouts, newLayout]);
    setActiveLayoutId(id);
  };

  const handleMouseDown = (e: React.MouseEvent<SVGGElement>, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;
    const machine = activeLayout.machines.find((m) => m.id === id);
    if (!machine) return;
    const svgX = e.clientX - svgRect.left;
    const svgY = e.clientY - svgRect.top;
    setDragging({ id, offsetX: svgX - machine.x, offsetY: svgY - machine.y });
  };

  const [localMachines, setLocalMachines] = useState(activeLayout.machines);
  useEffect(() => { if (!dragging) setLocalMachines(activeLayout.machines); }, [activeLayout.machines, dragging]);
  const activeMachines = dragging ? localMachines : activeLayout.machines;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;
    const newX = snap(Math.max(0, e.clientX - svgRect.left - dragging.offsetX));
    const newY = snap(Math.max(0, e.clientY - svgRect.top - dragging.offsetY));
    dragPos.current = { id: dragging.id, x: newX, y: newY };
    setLocalMachines(activeLayout.machines.map((m) => m.id === dragging.id ? { ...m, x: newX, y: newY } : m));
  };

  const handleMouseUp = () => {
    if (dragging && dragPos.current) {
      const { id, x, y } = dragPos.current;
      updateLayout({ ...activeLayout, machines: activeLayout.machines.map((m) => m.id === id ? { ...m, x, y } : m) });
      dragPos.current = null;
    }
    setDragging(null);
  };

  const exportSVG = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${activeLayout.name}.svg`; a.click(); URL.revokeObjectURL(url);
  };

  const selectedMachine = activeLayout.machines.find((m) => m.id === selectedId);
  const machineOptions = activeLayout.machines.map((m) => ({ value: m.id, label: m.name }));

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Layout-suunnitelma</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5">Raahaa koneita halutuille paikoille · Grid: {GRID} px</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={exportSVG}>Vie SVG</Button>
          <Button size="sm" icon={<PlusCircle size={14} />} onClick={addLayout}>Uusi layout</Button>
        </div>
      </div>

      {/* Layout tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {layouts.map((l) => (
          <button
            key={l.id}
            onClick={() => setActiveLayoutId(l.id)}
            className={[
              'px-3 py-1.5 text-xs rounded-lg whitespace-nowrap border transition-colors',
              l.id === activeLayoutId
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-primary-300 dark:border-primary-700'
                : 'bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-200',
            ].join(' ')}
          >
            {l.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Toolbox */}
        <div className="xl:col-span-1 space-y-3">
          <Card title="Lisää kone" accent>
            <div className="space-y-1">
              {machineTemplates.map((tmpl) => (
                <button
                  key={tmpl.type}
                  onClick={() => addMachine(tmpl)}
                  className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-xs text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700"
                >
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: tmpl.color }} />
                  {tmpl.label}
                </button>
              ))}
            </div>
          </Card>

          {selectedMachine && (
            <Card title="Valittu kone" accent>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: selectedMachine.color }} />
                  <span className="text-neutral-900 dark:text-neutral-100 font-medium">{selectedMachine.name}</span>
                </div>
                <div className="text-neutral-500">X: {selectedMachine.x} · Y: {selectedMachine.y}</div>
                <div className="text-neutral-500">{selectedMachine.width} × {selectedMachine.height} px</div>
                <Button variant="danger" size="sm" className="w-full" icon={<Trash2 size={12} />}
                  onClick={() => deleteMachine(selectedMachine.id)}>
                  Poista kone
                </Button>
              </div>
            </Card>
          )}

          <Card title="Materiaalivirta" accent>
            {activeLayout.flows.map((f) => {
              const fromM = activeLayout.machines.find((m) => m.id === f.from);
              const toM = activeLayout.machines.find((m) => m.id === f.to);
              return (
                <div key={f.id} className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 py-1 border-b border-neutral-100 dark:border-neutral-800">
                  <span>{fromM?.name ?? f.from} → {toM?.name ?? f.to}</span>
                  <button onClick={() => updateLayout({ ...activeLayout, flows: activeLayout.flows.filter((fl) => fl.id !== f.id) })}
                    className="text-danger hover:text-red-400 text-xs ml-2 transition-colors">✕</button>
                </div>
              );
            })}
            {!showAddFlow ? (
              <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setShowAddFlow(true)}>+ Lisää virta</Button>
            ) : (
              <div className="mt-2 space-y-2">
                <Select placeholder="Lähtö..." value={flowFrom} onChange={(e) => setFlowFrom(e.target.value)} options={machineOptions} />
                <Select placeholder="Kohde..." value={flowTo} onChange={(e) => setFlowTo(e.target.value)} options={machineOptions} />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={addFlow}>Lisää</Button>
                  <Button variant="secondary" size="sm" onClick={() => setShowAddFlow(false)}>Peruuta</Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Canvas */}
        <div className="xl:col-span-3">
          <Card accent>
            <div className="overflow-auto">
              <svg
                ref={svgRef}
                width={CANVAS_W}
                height={CANVAS_H}
                className="bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 cursor-default"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={() => setSelectedId(null)}
              >
                {/* Grid */}
                <defs>
                  <pattern id="layout-grid" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
                    <path d={`M ${GRID} 0 L 0 0 0 ${GRID}`} fill="none" stroke="#E9ECEF" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width={CANVAS_W} height={CANVAS_H} fill="url(#layout-grid)" />
                <defs>
                  <pattern id="layout-grid-dark" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
                    <path d={`M ${GRID} 0 L 0 0 0 ${GRID}`} fill="none" stroke="#212529" strokeWidth="0.5" />
                  </pattern>
                </defs>

                {/* Flow arrows */}
                <defs>
                  <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#7B2D8E" opacity="0.8" />
                  </marker>
                </defs>
                {activeLayout.flows.map((flow) => {
                  const fromM = activeLayout.machines.find((m) => m.id === flow.from);
                  const toM = activeLayout.machines.find((m) => m.id === flow.to);
                  if (!fromM || !toM) return null;
                  const from = getMachineCenter(fromM);
                  const to = getMachineCenter(toM);
                  return (
                    <g key={flow.id}>
                      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                        stroke="#7B2D8E" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.7" markerEnd="url(#arrow)" />
                      {flow.label && (
                        <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 4} fill="#7B2D8E" fontSize="9" textAnchor="middle" opacity="0.8">{flow.label}</text>
                      )}
                    </g>
                  );
                })}

                {/* Machines */}
                {activeMachines.map((machine) => {
                  const isSelected = machine.id === selectedId;
                  return (
                    <g key={machine.id} onMouseDown={(e) => handleMouseDown(e, machine.id)} style={{ cursor: 'grab' }}>
                      <rect x={machine.x} y={machine.y} width={machine.width} height={machine.height}
                        fill={machine.color} fillOpacity={isSelected ? 0.3 : 0.15}
                        stroke={isSelected ? '#7B2D8E' : machine.color}
                        strokeWidth={isSelected ? 2 : 1} rx={4} />
                      <text x={machine.x + machine.width / 2} y={machine.y + machine.height / 2 - 4}
                        fill={machine.color} fontSize="10" textAnchor="middle" fontWeight="600">{machine.name}</text>
                      <text x={machine.x + machine.width / 2} y={machine.y + machine.height / 2 + 10}
                        fill="#6C757D" fontSize="8" textAnchor="middle">{machine.width}×{machine.height}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
