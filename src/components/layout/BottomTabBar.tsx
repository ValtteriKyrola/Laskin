import { useStore } from '../../store/useStore';
import { navItems } from './Sidebar';

export default function BottomTabBar() {
  const { activeTab, setActiveTab } = useStore();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex safe-pb">
      {navItems.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={[
              'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors min-w-0',
              isActive
                ? 'text-primary-500'
                : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300',
            ].join(' ')}
          >
            <Icon size={20} className={isActive ? 'text-primary-500' : ''} />
            <span className="hidden sm:block truncate w-full text-center px-0.5 text-[10px]">{label.split(' ')[0]}</span>
          </button>
        );
      })}
    </nav>
  );
}
