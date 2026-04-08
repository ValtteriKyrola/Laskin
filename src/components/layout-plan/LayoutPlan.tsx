import { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import type { Machine, LayoutOption, MaterialFlow } from '../../types';
import { Card, Button, Select, Badge } from '../ui';
import { PlusCircle, Download, Trash2, ArrowRight } from 'lucide-react';

const GRID = 20;
const CANVAS_W = 1000;
const CANVAS_H = 600;

// Machine catalogue – matches the planned FieldLab equipment
const machineTemplates: Array<{
  type: Machine['type']; label: string; role: string; color: string; w: number; h: number;
}> = [
  { type: 'meltio',           label: 'Meltio Engine Robot',   role: 'DED-tulostus',           color: '#3B82F6', w: 140, h: 110 },
  { type: 'abb-robot',        label: 'ABB IRB 2600',          role: 'Teollisuusrobotti',       color: '#6366F1', w: 100, h: 90  },
  { type: 'machining-center', label: 'DNM 5700',              role: 'CNC 3-akselinen',         color: '#10B981', w: 150, h: 110 },
  { type: 'cobot',            label: 'UR10e Cobot',           role: 'Yhteistyörobotti',        color: '#8B5CF6', w: 90,  h: 80  },
  { type: 'fastems',          label: 'FASTEMS MMS',           role: 'Palettivarasto / MMS',    color: '#F59E0B', w: 170, h: 120 },
  { type: 'amr',              label: 'MiR250 AMR',            role: 'Autonominen kuljetus',    color: '#EC4899', w: 80,  h: 80  },
  { type: 'measurement',      label: 'Mittausasema (CMM)',    role: 'Koordinaattimittaus',     color: '#06B6D4', w: 110, h: 80  },
  { type: 'storage',          label: 'Varasto / puskuri',     role: 'Materiaalivarasto',       color: '#6B7280', w: 170, h: 100 },
];

const colorMap: Record<string, string> = Object.fromEntries(
  machineTemplates.map(t => [t.type, t.color])
);

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
  const [flowLabel, setFlowLabel] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);

  const updateLayout = useCallback((updated: LayoutOption) => {
    setLayouts(layouts.map((l) => (l.id === updated.id ? updated : l)));
  }, [layouts, setLayouts]);

  const addMachine = (tmpl: typeof machineTemplates[0]) => {
    const id = `m${Date.now()}`;
    const newMachine: Machine = {
      id, type: tmpl.type, name: tmpl.label,
      x: snap(80 + Math.random() * 200), y: snap(60 + Math.random() * 100),
      width: tmpl.w, height: tmpl.h, color: tmpl.color, rotation: 0,
    };
    updateLayout({ ...activeLayout, machines: [...activeLayout.machines, newMachine] });
  };

  const deleteMachine = (id: string) => {
    updateLayout({
      ...activeLayout,
      machines: activeLayout.machines.filter((m) => m.id !== id),
      flows: activeLayout.flows.filter((f) => f.from !== id && f.to !== id),
    });
    setSelectedId(null);
  };

  const addFlow = () => {
    if (!flowFrom || !flowTo || flowFrom === flowTo) return;
    const newFlow: MaterialFlow = { id: `f${Date.now()}`, from: flowFrom, to: flowTo, label: flowLabel || undefined };
    updateLayout({ ...activeLayout, flows: [...activeLayout.flows, newFlow] });
    setShowAddFlow(false); setFlowFrom(''); setFlowTo(''); setFlowLabel('');
  };

  const addLayout = () => {
    const id = `layout-${Date.now()}`;
    const newLayout: LayoutOption = {
      id, name: `Layout ${String.fromCharCode(65 + layouts.length)}`,
      machines: [], flows: [], createdAt: new Date().toISOString(),
    };
    setLayouts([...layouts, newLayout]);
    setActiveLayoutId(id);
  };

  // Drag logic
  const [localMachines, setLocalMachines] = useState(activeLayout.machines);
  useEffect(() => { if (!dragging) setLocalMachines(activeLayout.machines); }, [activeLayout.machines, dragging]);
  const activeMachines = dragging ? localMachines : activeLayout.machines;

  const handleMouseDown = (e: React.MouseEvent<SVGGElement>, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;
    const machine = activeLayout.machines.find((m) => m.id === id);
    if (!machine) return;
    const scaleX = CANVAS_W / svgRect.width;
    const scaleY = CANVAS_H / svgRect.height;
    const svgX = (e.clientX - svgRect.left) * scaleX;
    const svgY = (e.clientY - svgRect.top) * scaleY;
    setDragging({ id, offsetX: svgX - machine.x, offsetY: svgY - machine.y });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;
    const scaleX = CANVAS_W / svgRect.width;
    const scaleY = CANVAS_H / svgRect.height;
    const newX = snap(Math.max(0, (e.clientX - svgRect.left) * scaleX - dragging.offsetX));
    const newY = snap(Math.max(0, (e.clientY - svgRect.top) * scaleY - dragging.offsetY));
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

  // Count how many of each type are on canvas
  const onCanvas = new Set(activeLayout.machines.map(m => m.type));

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-screen-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Layout-suunnitelma</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5">
            Raahaa koneita halutuille paikoille · {activeLayout.machines.length} laitetta · {activeLayout.flows.length} materiaalivirtaa
          </p>
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
              'px-3 py-1.5 text-xs rounded-lg whitespace-nowrap border font-medium transition-colors',
              l.id === activeLayoutId
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-primary-300 dark:border-primary-700'
                : 'bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-200',
            ].join(' ')}
          >
            {l.name}
          </button>
        ))}
      </div>

      {/* Controls row: Toolbox | Flows | Selected */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Toolbox */}
        <Card title="Laitekatalogi" accent>
          <div className="grid grid-cols-1 gap-1.5">
            {machineTemplates.map((tmpl) => {
              const placed = onCanvas.has(tmpl.type);
              return (
                <button
                  key={tmpl.type}
                  onClick={() => addMachine(tmpl)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 hover:bg-white dark:hover:bg-neutral-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm transition-all text-left group"
                >
                  <span className="w-3.5 h-3.5 rounded shrink-0 shadow-sm" style={{ backgroundColor: tmpl.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">{tmpl.label}</div>
                    <div className="text-[10px] text-neutral-400 truncate">{tmpl.role}</div>
                  </div>
                  {placed && <Badge variant="success" size="sm">✓</Badge>}
                  {!placed && <span className="text-[10px] text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity">+ lisää</span>}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Material flows */}
        <Card title="Materiaalivirrat" accent>
          <div className="space-y-1.5 mb-3">
            {activeLayout.flows.length === 0 && (
              <p className="text-xs text-neutral-400 italic">Ei materiaalivirtoja. Lisää alla.</p>
            )}
            {activeLayout.flows.map((f) => {
              const fromM = activeLayout.machines.find((m) => m.id === f.from);
              const toM = activeLayout.machines.find((m) => m.id === f.to);
              return (
                <div key={f.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colorMap[fromM?.type ?? ''] ?? '#999' }} />
                  <span className="text-neutral-700 dark:text-neutral-300 truncate flex-1">
                    {fromM?.name ?? '?'}
                  </span>
                  <ArrowRight size={11} className="text-neutral-400 shrink-0" />
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colorMap[toM?.type ?? ''] ?? '#999' }} />
                  <span className="text-neutral-700 dark:text-neutral-300 truncate flex-1">
                    {toM?.name ?? '?'}
                  </span>
                  {f.label && <span className="text-neutral-400 italic truncate max-w-[60px]">{f.label}</span>}
                  <button
                    onClick={() => updateLayout({ ...activeLayout, flows: activeLayout.flows.filter((fl) => fl.id !== f.id) })}
                    className="text-neutral-300 hover:text-danger transition-colors ml-1 shrink-0"
                    aria-label="Poista virta"
                  >✕</button>
                </div>
              );
            })}
          </div>

          {!showAddFlow ? (
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowAddFlow(true)}>
              + Lisää materiaalivirta
            </Button>
          ) : (
            <div className="space-y-2 mt-2 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700">
              <Select placeholder="Lähtöpiste..." value={flowFrom} onChange={(e) => setFlowFrom(e.target.value)} options={machineOptions} />
              <Select placeholder="Kohde..." value={flowTo} onChange={(e) => setFlowTo(e.target.value)} options={machineOptions} />
              <input
                className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary-500"
                placeholder="Selite (valinnainen, esim. 'DED-aihio')"
                value={flowLabel}
                onChange={e => setFlowLabel(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={addFlow}>Lisää</Button>
                <Button variant="secondary" size="sm" onClick={() => setShowAddFlow(false)}>Peruuta</Button>
              </div>
            </div>
          )}
        </Card>

        {/* Selected machine / legend */}
        <div className="space-y-3">
          {selectedMachine ? (
            <Card title="Valittu laite" accent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-md shadow-sm shrink-0" style={{ backgroundColor: selectedMachine.color }} />
                  <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{selectedMachine.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ['Sijainti X', `${selectedMachine.x} px`],
                    ['Sijainti Y', `${selectedMachine.y} px`],
                    ['Leveys', `${selectedMachine.width} px`],
                    ['Korkeus', `${selectedMachine.height} px`],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-neutral-50 dark:bg-neutral-900 rounded-lg px-3 py-2">
                      <div className="text-[10px] text-neutral-400 uppercase tracking-wide">{k}</div>
                      <div className="font-mono font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>
                <Button variant="danger" size="sm" className="w-full" icon={<Trash2 size={12} />}
                  onClick={() => deleteMachine(selectedMachine.id)}>
                  Poista layoutista
                </Button>
              </div>
            </Card>
          ) : (
            <Card title="Laitteet" accent>
              <div className="space-y-1.5">
                {activeLayout.machines.map(m => (
                  <div key={m.id} className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded shrink-0" style={{ backgroundColor: m.color }} />
                    <span className="text-neutral-700 dark:text-neutral-300">{m.name}</span>
                  </div>
                ))}
                {activeLayout.machines.length === 0 && (
                  <p className="text-xs text-neutral-400 italic">Ei laitteita. Lisää laitekatalogista.</p>
                )}
              </div>
              <p className="text-[10px] text-neutral-400 mt-3">Klikkaa laitetta nähdäksesi sen tiedot.</p>
            </Card>
          )}
        </div>
      </div>

      {/* Canvas – full width below */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-700">
          <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Pohjapiirros</span>
          <span className="text-xs text-neutral-400">Grid {GRID} px · {CANVAS_W}×{CANVAS_H} · raahaa koneita</span>
        </div>
        <div className="overflow-auto p-2">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
            style={{ width: '100%', minWidth: 600, height: 'auto', aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
            className="bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-800 cursor-default block"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={() => setSelectedId(null)}
          >
            {/* Grid pattern */}
            <defs>
              <pattern id="lg" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
                <path d={`M ${GRID} 0 L 0 0 0 ${GRID}`} fill="none" stroke="#E9ECEF" strokeWidth="0.5" />
              </pattern>
              <pattern id="lg-major" width={GRID * 5} height={GRID * 5} patternUnits="userSpaceOnUse">
                <path d={`M ${GRID * 5} 0 L 0 0 0 ${GRID * 5}`} fill="none" stroke="#DEE2E6" strokeWidth="1" />
              </pattern>
              <marker id="flow-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#7B2D8E" opacity="0.85" />
              </marker>
            </defs>
            <rect width={CANVAS_W} height={CANVAS_H} fill="url(#lg)" />
            <rect width={CANVAS_W} height={CANVAS_H} fill="url(#lg-major)" />

            {/* ── Floor plan walls (pohjapiirrustus) ── */}
            <g style={{ pointerEvents: 'none' }}>
              {/* Outer room boundary */}
              <rect x={4} y={4} width={CANVAS_W - 8} height={CANVAS_H - 8}
                fill="none" stroke="#1E293B" strokeWidth={8} strokeLinejoin="miter" />
              {/* Inner partition – left vertical (x=280, full height to shelf) */}
              <line x1={280} y1={4} x2={280} y2={380}
                stroke="#1E293B" strokeWidth={8} strokeLinecap="square" />
              {/* Inner partition – horizontal shelf (y=380, x=280→520) */}
              <line x1={280} y1={380} x2={520} y2={380}
                stroke="#1E293B" strokeWidth={8} strokeLinecap="square" />
              {/* Inner partition – right vertical (x=520, full height to shelf) */}
              <line x1={520} y1={4} x2={520} y2={380}
                stroke="#1E293B" strokeWidth={8} strokeLinecap="square" />
            </g>
            <text x={20} y={24} fill="#94A3B8" fontSize="11" fontFamily="system-ui">FieldLab – tuotantosolu</text>

            {/* Material flow lines */}
            {activeLayout.flows.map((flow) => {
              const fromM = activeLayout.machines.find((m) => m.id === flow.from);
              const toM = activeLayout.machines.find((m) => m.id === flow.to);
              if (!fromM || !toM) return null;
              const from = getMachineCenter(fromM);
              const to = getMachineCenter(toM);
              const mx = (from.x + to.x) / 2;
              const my = (from.y + to.y) / 2;
              return (
                <g key={flow.id}>
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke="#7B2D8E" strokeWidth="1.5" strokeDasharray="6,3"
                    opacity="0.65" markerEnd="url(#flow-arrow)" />
                  {flow.label && (
                    <g>
                      <rect x={mx - 28} y={my - 9} width={56} height={14} rx={3} fill="white" fillOpacity="0.85" />
                      <text x={mx} y={my + 2} fill="#7B2D8E" fontSize="8.5" textAnchor="middle"
                        fontWeight="600" fontFamily="system-ui">{flow.label}</text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Machines */}
            {activeMachines.map((machine) => {
              const isSelected = machine.id === selectedId;
              const cx = machine.x + machine.width / 2;
              const cy = machine.y + machine.height / 2;
              return (
                <g key={machine.id}
                  onMouseDown={(e) => handleMouseDown(e, machine.id)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ cursor: dragging?.id === machine.id ? 'grabbing' : 'grab' }}
                >
                  {/* Shadow */}
                  <rect x={machine.x + 3} y={machine.y + 3}
                    width={machine.width} height={machine.height}
                    rx={6} fill="black" opacity="0.06" />
                  {/* Body */}
                  <rect x={machine.x} y={machine.y}
                    width={machine.width} height={machine.height}
                    fill={machine.color} fillOpacity={isSelected ? 0.22 : 0.12}
                    stroke={machine.color}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    rx={6}
                    strokeDasharray={isSelected ? undefined : undefined}
                  />
                  {/* Color header bar */}
                  <rect x={machine.x} y={machine.y}
                    width={machine.width} height={8}
                    fill={machine.color} fillOpacity={isSelected ? 0.7 : 0.5}
                    rx={6} />
                  <rect x={machine.x} y={machine.y + 4}
                    width={machine.width} height={4}
                    fill={machine.color} fillOpacity={isSelected ? 0.7 : 0.5} />
                  {/* Name */}
                  <text x={cx} y={cy - 2}
                    fill={machine.color} fontSize="10.5" textAnchor="middle"
                    fontWeight="700" fontFamily="system-ui"
                    style={{ filter: 'drop-shadow(0 0 2px white)' }}>
                    {machine.name}
                  </text>
                  {/* Dimensions */}
                  <text x={cx} y={cy + 13}
                    fill="#64748B" fontSize="8" textAnchor="middle" fontFamily="system-ui">
                    {machine.width}×{machine.height} px
                  </text>
                  {/* Selection ring */}
                  {isSelected && (
                    <rect x={machine.x - 3} y={machine.y - 3}
                      width={machine.width + 6} height={machine.height + 6}
                      fill="none" stroke="#7B2D8E" strokeWidth="1.5"
                      strokeDasharray="4,3" rx={8} opacity="0.7" />
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

    </div>
  );
}
