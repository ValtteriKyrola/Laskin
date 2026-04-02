import { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { FASTEMSNode } from '../../types';
import Card from '../shared/Card';

const typeConfig: Record<FASTEMSNode['type'], { label: string; color: string; icon: string }> = {
  product:   { label: 'Tuote',      color: 'text-yellow-400 border-yellow-500/40 bg-yellow-900/20', icon: '📦' },
  assembly:  { label: 'Kokoonpano', color: 'text-blue-400 border-blue-500/40 bg-blue-900/20',     icon: '🔧' },
  part:      { label: 'Osa',        color: 'text-green-400 border-green-500/40 bg-green-900/20',  icon: '⚙️' },
  operation: { label: 'Työvaihe',   color: 'text-purple-400 border-purple-500/40 bg-purple-900/20', icon: '🏭' },
  program:   { label: 'NC-ohjelma', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-900/20',     icon: '💾' },
};

function updateNode(tree: FASTEMSNode, id: string, updater: (node: FASTEMSNode) => FASTEMSNode): FASTEMSNode {
  if (tree.id === id) return updater(tree);
  return { ...tree, children: tree.children.map((c) => updateNode(c, id, updater)) };
}

function deleteNode(tree: FASTEMSNode, id: string): FASTEMSNode {
  return {
    ...tree,
    children: tree.children
      .filter((c) => c.id !== id)
      .map((c) => deleteNode(c, id)),
  };
}

function countNodes(node: FASTEMSNode): number {
  return 1 + node.children.reduce((s, c) => s + countNodes(c), 0);
}

function totalTime(node: FASTEMSNode): number {
  if (node.children.length === 0) return node.manufacturingTime;
  return node.children.reduce((s, c) => s + totalTime(c), 0);
}

function NodeRow({
  node, depth, onToggle, onEdit, onDelete, onAdd,
}: {
  node: FASTEMSNode;
  depth: number;
  onToggle: (id: string) => void;
  onEdit: (node: FASTEMSNode) => void;
  onDelete: (id: string) => void;
  onAdd: (parentId: string) => void;
}) {
  const cfg = typeConfig[node.type];
  const hasChildren = node.children.length > 0;

  return (
    <>
      <tr className="border-b border-gray-800/40 hover:bg-gray-800/20 group">
        <td className="py-1.5 pr-2">
          <div className="flex items-center gap-1" style={{ paddingLeft: `${depth * 20}px` }}>
            <button
              onClick={() => onToggle(node.id)}
              className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-200 text-xs"
            >
              {hasChildren ? (node.expanded ? '▼' : '▶') : '·'}
            </button>
            <span className={`text-xs px-1.5 py-0.5 rounded border ${cfg.color} font-medium shrink-0`}>
              {cfg.icon} {cfg.label}
            </span>
            <span className="text-white text-sm font-medium ml-1">{node.name}</span>
          </div>
        </td>
        <td className="py-1.5 text-xs text-gray-400 max-w-xs truncate">{node.description}</td>
        <td className="py-1.5 text-xs text-gray-400 text-center">
          {node.type === 'program' || node.type === 'operation'
            ? `${node.manufacturingTime} min`
            : node.children.length > 0
            ? `${totalTime(node)} min`
            : '–'}
        </td>
        <td className="py-1.5 text-xs text-gray-400">{node.machine || '–'}</td>
        <td className="py-1.5 text-xs text-gray-400">{node.fixture || '–'}</td>
        <td className="py-1.5 text-xs">
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(node)} className="text-yellow-400 hover:text-yellow-300 px-1">✎</button>
            {node.type !== 'program' && (
              <button onClick={() => onAdd(node.id)} className="text-green-400 hover:text-green-300 px-1">+</button>
            )}
            <button onClick={() => onDelete(node.id)} className="text-red-400 hover:text-red-300 px-1">✕</button>
          </div>
        </td>
      </tr>
      {node.expanded && node.children.map((child) => (
        <NodeRow
          key={child.id}
          node={child}
          depth={depth + 1}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          onAdd={onAdd}
        />
      ))}
    </>
  );
}

const emptyNode = (): Omit<FASTEMSNode, 'id' | 'children'> => ({
  type: 'part',
  name: '',
  description: '',
  manufacturingTime: 0,
  machine: '',
  fixture: '',
  expanded: true,
});

export default function FASTEMSTree() {
  const { fastemTree, setFASTEMTree } = useStore();
  const [editNode, setEditNode] = useState<FASTEMSNode | null>(null);
  const [addParentId, setAddParentId] = useState<string | null>(null);
  const [newNodeForm, setNewNodeForm] = useState(emptyNode());
  const [showExport, setShowExport] = useState(false);

  const toggle = (id: string) => {
    setFASTEMTree(updateNode(fastemTree, id, (n) => ({ ...n, expanded: !n.expanded })));
  };

  const openEdit = (node: FASTEMSNode) => setEditNode({ ...node });

  const saveEdit = () => {
    if (!editNode) return;
    setFASTEMTree(updateNode(fastemTree, editNode.id, () => editNode));
    setEditNode(null);
  };

  const handleDelete = (id: string) => {
    if (id === fastemTree.id) return;
    setFASTEMTree(deleteNode(fastemTree, id));
  };

  const openAdd = (parentId: string) => {
    setAddParentId(parentId);
    setNewNodeForm(emptyNode());
  };

  const saveAdd = () => {
    if (!addParentId) return;
    const newN: FASTEMSNode = { ...newNodeForm, id: `n${Date.now()}`, children: [], expanded: true };
    setFASTEMTree(updateNode(fastemTree, addParentId, (p) => ({
      ...p,
      children: [...p.children, newN],
      expanded: true,
    })));
    setAddParentId(null);
  };

  const exportJSON = () => {
    const json = JSON.stringify(fastemTree, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fastems-bom.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalNodes = countNodes(fastemTree);
  const totalMinutes = totalTime(fastemTree);

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">FASTEMS MMS – Tuoterakenne</h1>
          <p className="text-gray-400 text-xs mt-0.5">Hierarkkinen tuoterakennepuu · Klikkaa ▶ avataksesi solmun</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportJSON} className="btn-secondary text-xs">Vie JSON</button>
          <button onClick={() => setShowExport(!showExport)} className="btn-primary text-xs">Näytä JSON</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Solmuja yhteensä', value: totalNodes, color: 'text-blue-400' },
          { label: 'Kokonaisvalmistusaika', value: `${totalMinutes} min`, color: 'text-green-400' },
          { label: 'Hierarkiatasoja', value: '5 (tuote → NC)', color: 'text-yellow-400' },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tree table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-400">
                <th className="text-left py-2 font-medium">Nimike / tyyppi</th>
                <th className="text-left py-2 font-medium">Kuvaus</th>
                <th className="text-center py-2 font-medium">Aika</th>
                <th className="text-left py-2 font-medium">Kone/solu</th>
                <th className="text-left py-2 font-medium">Kiinnitin</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              <NodeRow
                node={fastemTree}
                depth={0}
                onToggle={toggle}
                onEdit={openEdit}
                onDelete={handleDelete}
                onAdd={openAdd}
              />
            </tbody>
          </table>
        </div>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(typeConfig).map(([type, cfg]) => (
          <span key={type} className={`text-xs px-2 py-0.5 rounded border ${cfg.color}`}>
            {cfg.icon} {cfg.label}
          </span>
        ))}
      </div>

      {/* JSON export panel */}
      {showExport && (
        <Card title="JSON-vienti (MMS-yhteensopiva)">
          <pre className="text-xs text-gray-400 overflow-auto max-h-80 bg-gray-950 rounded-lg p-3">
            {JSON.stringify(fastemTree, null, 2)}
          </pre>
        </Card>
      )}

      {/* Edit modal */}
      {editNode && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md space-y-3">
            <h2 className="text-white font-bold">Muokkaa solmua</h2>
            <div className="space-y-2 text-sm">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Tyyppi</label>
                <select className="select" value={editNode.type}
                  onChange={(e) => setEditNode((n) => n ? { ...n, type: e.target.value as FASTEMSNode['type'] } : n)}>
                  {Object.keys(typeConfig).map((t) => <option key={t} value={t}>{typeConfig[t as FASTEMSNode['type']].label}</option>)}
                </select>
              </div>
              {(['name', 'description', 'machine', 'fixture'] as const).map((field) => (
                <div key={field}>
                  <label className="text-xs text-gray-400 block mb-1 capitalize">{field === 'name' ? 'Nimi' : field === 'description' ? 'Kuvaus' : field === 'machine' ? 'Kone/solu' : 'Kiinnitin'}</label>
                  <input className="input" value={editNode[field]}
                    onChange={(e) => setEditNode((n) => n ? { ...n, [field]: e.target.value } : n)} />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Valmistusaika (min)</label>
                <input type="number" className="input" value={editNode.manufacturingTime}
                  onChange={(e) => setEditNode((n) => n ? { ...n, manufacturingTime: Number(e.target.value) } : n)} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditNode(null)} className="btn-secondary">Peruuta</button>
              <button onClick={saveEdit} className="btn-primary">Tallenna</button>
            </div>
          </div>
        </div>
      )}

      {/* Add modal */}
      {addParentId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md space-y-3">
            <h2 className="text-white font-bold">Lisää alisolmu</h2>
            <div className="space-y-2 text-sm">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Tyyppi</label>
                <select className="select" value={newNodeForm.type}
                  onChange={(e) => setNewNodeForm((f) => ({ ...f, type: e.target.value as FASTEMSNode['type'] }))}>
                  {Object.keys(typeConfig).map((t) => <option key={t} value={t}>{typeConfig[t as FASTEMSNode['type']].label}</option>)}
                </select>
              </div>
              {(['name', 'description', 'machine', 'fixture'] as const).map((field) => (
                <div key={field}>
                  <label className="text-xs text-gray-400 block mb-1">{field === 'name' ? 'Nimi' : field === 'description' ? 'Kuvaus' : field === 'machine' ? 'Kone/solu' : 'Kiinnitin'}</label>
                  <input className="input" value={newNodeForm[field]}
                    onChange={(e) => setNewNodeForm((f) => ({ ...f, [field]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Valmistusaika (min)</label>
                <input type="number" className="input" value={newNodeForm.manufacturingTime}
                  onChange={(e) => setNewNodeForm((f) => ({ ...f, manufacturingTime: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setAddParentId(null)} className="btn-secondary">Peruuta</button>
              <button onClick={saveAdd} className="btn-primary">Lisää</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
