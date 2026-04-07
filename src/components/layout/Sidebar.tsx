import { useState } from 'react';
import {
  LayoutDashboard, Map, TrendingUp, Layers, GitBranch,
  Package, BarChart3, ChevronLeft, ChevronRight, Sun, Moon,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../hooks/useTheme';
import SessionBar from './SessionBar';

export const navItems = [
  { id: 'dashboard',   label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'layout',      label: 'Layout-suunn.', icon: Map },
  { id: 'investments', label: 'Investoinnit',  icon: TrendingUp },
  { id: 'ded',         label: 'Meltio DED',    icon: Layers },
  { id: 'fastems',     label: 'FASTEMS',        icon: GitBranch },
  { id: 'odoo',        label: 'Odoo ERP',       icon: Package },
  { id: 'quality',     label: 'Datan keruu',   icon: BarChart3 },
];

export default function Sidebar() {
  const { activeTab, setActiveTab, onlineUsers } = useStore();
  const { isDark, toggle } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={[
        'hidden lg:flex flex-col h-screen sticky top-0 shrink-0',
        'bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800',
        'transition-all duration-300',
        collapsed ? 'w-14' : 'w-56',
      ].join(' ')}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-3 h-14 border-b border-neutral-200 dark:border-neutral-800 shrink-0 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-xs">FL</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-tight truncate">TAMK FieldLab</div>
            <span className="text-[10px] font-medium px-1.5 py-0 bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-full">HMLV</span>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          const othersHere = onlineUsers.filter((u) => u.activeTab === id);
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              title={collapsed ? label : undefined}
              className={[
                'relative w-full flex items-center rounded-lg mb-0.5 transition-all duration-200',
                collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2',
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100',
              ].join(' ')}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="text-sm font-medium truncate">{label}</span>}
              {othersHere.length > 0 && (
                <span className={`${collapsed ? 'absolute top-1 right-1' : 'ml-auto'} flex gap-0.5`}>
                  {othersHere.slice(0, 2).map((u) => (
                    <span
                      key={u.name}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: u.color }}
                      title={u.name}
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom: theme + session + collapse */}
      <div className="shrink-0 border-t border-neutral-200 dark:border-neutral-800 p-2 space-y-1">
        {!collapsed && (
          <div className="px-1 pb-1">
            <SessionBar compact />
          </div>
        )}
        <button
          onClick={toggle}
          title={isDark ? 'Vaalea tila' : 'Tumma tila'}
          className={[
            'w-full flex items-center rounded-lg transition-colors text-neutral-500 dark:text-neutral-400',
            'hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200',
            collapsed ? 'justify-center p-2.5' : 'gap-2 px-3 py-2',
          ].join(' ')}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          {!collapsed && <span className="text-xs">{isDark ? 'Vaalea tila' : 'Tumma tila'}</span>}
        </button>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={[
            'w-full flex items-center rounded-lg transition-colors text-neutral-400',
            'hover:bg-neutral-100 dark:hover:bg-neutral-800',
            collapsed ? 'justify-center p-2.5' : 'gap-2 px-3 py-2 justify-end',
          ].join(' ')}
        >
          {collapsed ? <ChevronRight size={16} /> : <><span className="text-xs flex-1 text-left">Pienennä</span><ChevronLeft size={16} /></>}
        </button>
      </div>
    </aside>
  );
}
