import { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { FASTEMSNode } from '../../types';
import { Card, Modal, Button, Badge, Input, Select } from '../ui';
import { Download, FileJson } from 'lucide-react';

const typeConfig: Record<FASTEMSNode['type'], { label: string; variant: 'primary' | 'info' | 'success' | 'warning' | 'neutral'; icon: string }> = {
  product:   { label: 'Tuote',      variant: 'warning', icon: '📦' },
  assembly:  { label: 'Kokoonpano', variant: 'info',    icon: '🔧' },
  part:      { label: 'Osa',        variant: 'success', icon: '⚙️' },
  operation: { label: 'Työvaihe',   variant: 'primary', icon: '🏭' },
  program:   { label: 'NC-ohjelma', variant: 'neutral', icon: '💾' },
};

function updateNode(tree: FASTEMSNode, id: string, updater: (node: FASTEMSNode) => FASTEMSNode): FASTEMSNode {
  if (tree.id === id) return updater(tree);
  return { ...tree, children: tree.children.map((c) => updateNode(c, id, updater)) };
}

function deleteNode(tree: FASTEMSNode, id: string): FASTEMSNode {
  return { ...tree, children: tree.children.filter((c) => c.id !== id).map((c) => deleteNode(c, id)) };
}

function countNodes(node: FASTEMSNode): number { return 1 + node.children.reduce((s, c) => s + countNodes(c), 0); }
function totalTime(node: FASTEMSNode): number {
  if (node.children.length === 0) return node.manufacturingTime;
  return node.children.reduce((s, c) => s + totalTime(c), 0);
}

function NodeRow({ node, depth, onToggle, onEdit, onDelete, onAdd }: {
  node: FASTEMSNode; depth: number;
  onToggle: (id: string) => void; onEdit: (node: FASTEMSNode) => void;
  onDelete: (id: string) => void; onAdd: (parentId: string) => void;
}) {
  const cfg = typeConfig[node.type];
  const hasChildren = node.children.length > 0;

  return (
    <>
      <tr className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 group transition-colors">
        <td className="py-1.5 pr-2">
          <div className="flex items-center gap-1.5" style={{ paddingLeft: `${depth * 20}px` }}>
            <button onClick={() => onToggle(node.id)}
              className="w-5 h-5 flex items-center justify-center text-neutral-400 hover:text-primary-500 text-xs shrink-0 transition-colors">
              {hasChildren ? (node.expanded ? '▼' : '▶') : '·'}
            </button>
            <Badge variant={cfg.variant} size="sm" className="shrink-0">{cfg.icon} {cfg.label}</Badge>
            <span className="text-neutral-900 dark:text-neutral-100 text-sm font-medium">{node.name}</span>
          </div>
        </td>
        <td className="py-1.5 text-xs text-neutral-400 dark:text-neutral-500 max-w-xs truncate">{node.description}</td>
        <td className="py-1.5 text-xs text-neutral-500 dark:text-neutral-400 text-center">
          {node.type === 'program' || node.type === 'operation' ? `${node.manufacturingTime} min`
            : node.children.length > 0 ? `${totalTime(node)} min` : '–'}
        </td>
        <td className="py-1.5 text-xs text-neutral-500 dark:text-neutral-400">{node.machine || '–'}</td>
        <td className="py-1.5 text-xs text-neutral-500 dark:text-neutral-400">{node.fixture || '–'}</td>
        <td className="py-1.5 text-xs">
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(node)} className="px-1.5 py-0.5 text-primary-500 hover:text-primary-400 text-xs transition-colors">✎</button>
            {node.type !== 'program' && (
              <button onClick={() => onAdd(node.id)} className="px-1.5 py-0.5 text-success hover:text-green-400 text-xs transition-colors">+</button>
            )}
            <button onClick={() => onDelete(node.id)} className="px-1.5 py-0.5 text-danger hover:text-red-400 text-xs transition-colors">✕</button>
          </div>
        </td>
      </tr>
      {node.expanded && node.children.map((child) => (
        <NodeRow key={child.id} node={child} depth={depth + 1} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} onAdd={onAdd} />
      ))}
    </>
  );
}

const emptyNode = (): Omit<FASTEMSNode, 'id' | 'children'> => ({ type: 'part', name: '', description: '', manufacturingTime: 0, machine: '', fixture: '', expanded: true });

const typeOptions = Object.entries(typeConfig).map(([k, v]) => ({ value: k, label: `${v.icon} ${v.label}` }));

export default function FASTEMSTree() {
  const { fastemTree, setFASTEMTree } = useStore();
  const [editNode, setEditNode] = useState<FASTEMSNode | null>(null);
  const [addParentId, setAddParentId] = useState<string | null>(null);
  const [newNodeForm, setNewNodeForm] = useState(emptyNode());
  const [showJSON, setShowJSON] = useState(false);

  const toggle = (id: string) => setFASTEMTree(updateNode(fastemTree, id, (n) => ({ ...n, expanded: !n.expanded })));
  const openEdit = (node: FASTEMSNode) => setEditNode({ ...node });
  const saveEdit = () => { if (!editNode) return; setFASTEMTree(updateNode(fastemTree, editNode.id, () => editNode)); setEditNode(null); };
  const handleDelete = (id: string) => { if (id === fastemTree.id) return; setFASTEMTree(deleteNode(fastemTree, id)); };
  const openAdd = (parentId: string) => { setAddParentId(parentId); setNewNodeForm(emptyNode()); };
  const saveAdd = () => {
    if (!addParentId) return;
    const newN: FASTEMSNode = { ...newNodeForm, id: `n${Date.now()}`, children: [], expanded: true };
    setFASTEMTree(updateNode(fastemTree, addParentId, (p) => ({ ...p, children: [...p.children, newN], expanded: true })));
    setAddParentId(null);
  };
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(fastemTree, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'fastems-bom.json'; a.click(); URL.revokeObjectURL(url);
  };

  const totalNodes = countNodes(fastemTree);
  const totalMinutes = totalTime(fastemTree);

  const fieldLabels: Record<string, string> = { name: 'Nimi', description: 'Kuvaus', machine: 'Kone/solu', fixture: 'Kiinnitin' };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">FASTEMS MMS – Tuoterakenne</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-0.5">Hierarkkinen tuoterakennepuu · Klikkaa ▶ avataksesi solmun</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<FileJson size={14} />} onClick={() => setShowJSON((v) => !v)}>JSON</Button>
          <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={exportJSON}>Lataa</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Solmuja yhteensä', value: String(totalNodes), color: 'text-info' },
          { label: 'Kokonaisvalmistusaika', value: `${totalMinutes} min`, color: 'text-success' },
          { label: 'Hierarkiatasoja', value: '5 (tuote → NC)', color: 'text-primary-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-center shadow-card">
            <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
            <div className="text-xs text-neutral-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tree */}
      <Card accent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700 text-xs text-neutral-500 dark:text-neutral-400">
                {['Nimike / tyyppi', 'Kuvaus', 'Aika', 'Kone/solu', 'Kiinnitin', ''].map((h, i) => (
                  <th key={i} className={`py-2.5 font-semibold uppercase tracking-wider ${h === 'Aika' ? 'text-center' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <NodeRow node={fastemTree} depth={0} onToggle={toggle} onEdit={openEdit} onDelete={handleDelete} onAdd={openAdd} />
            </tbody>
          </table>
        </div>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(typeConfig).map(([type, cfg]) => (
          <Badge key={type} variant={cfg.variant}>{cfg.icon} {cfg.label}</Badge>
        ))}
      </div>

      {/* JSON panel */}
      {showJSON && (
        <Card title="JSON-vienti (MMS-yhteensopiva)" accent>
          <pre className="text-xs text-neutral-600 dark:text-neutral-400 overflow-auto max-h-80 bg-neutral-50 dark:bg-neutral-950 rounded-lg p-3">
            {JSON.stringify(fastemTree, null, 2)}
          </pre>
        </Card>
      )}

      {/* Edit modal */}
      <Modal open={!!editNode} onClose={() => setEditNode(null)} title="Muokkaa solmua">
        {editNode && (
          <div className="space-y-3">
            <Select label="Tyyppi" value={editNode.type}
              onChange={(e) => setEditNode((n) => n ? { ...n, type: e.target.value as FASTEMSNode['type'] } : n)}
              options={typeOptions} />
            {(['name', 'description', 'machine', 'fixture'] as const).map((field) => (
              <Input key={field} label={fieldLabels[field]} value={editNode[field]}
                onChange={(e) => setEditNode((n) => n ? { ...n, [field]: e.target.value } : n)} />
            ))}
            <Input label="Valmistusaika (min)" type="number" value={String(editNode.manufacturingTime)}
              onChange={(e) => setEditNode((n) => n ? { ...n, manufacturingTime: Number(e.target.value) } : n)} />
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="secondary" onClick={() => setEditNode(null)}>Peruuta</Button>
              <Button onClick={saveEdit}>Tallenna</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add modal */}
      <Modal open={!!addParentId} onClose={() => setAddParentId(null)} title="Lisää alisolmu">
        <div className="space-y-3">
          <Select label="Tyyppi" value={newNodeForm.type}
            onChange={(e) => setNewNodeForm((f) => ({ ...f, type: e.target.value as FASTEMSNode['type'] }))}
            options={typeOptions} />
          {(['name', 'description', 'machine', 'fixture'] as const).map((field) => (
            <Input key={field} label={fieldLabels[field]} value={newNodeForm[field]}
              onChange={(e) => setNewNodeForm((f) => ({ ...f, [field]: e.target.value }))} />
          ))}
          <Input label="Valmistusaika (min)" type="number" value={String(newNodeForm.manufacturingTime)}
            onChange={(e) => setNewNodeForm((f) => ({ ...f, manufacturingTime: Number(e.target.value) }))} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setAddParentId(null)}>Peruuta</Button>
            <Button onClick={saveAdd}>Lisää</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
