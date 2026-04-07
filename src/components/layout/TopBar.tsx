import { useStore } from '../../store/useStore';
import { navItems } from './Sidebar';
import SessionBar from './SessionBar';

export default function TopBar() {
  const { activeTab } = useStore();
  const current = navItems.find((n) => n.id === activeTab);

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-0 z-40">
      <div className="flex items-center gap-2">
        {current && <current.icon size={18} className="text-primary-500" />}
        <h1 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {current?.label ?? 'FieldLab'}
        </h1>
      </div>
      <SessionBar />
    </header>
  );
}
