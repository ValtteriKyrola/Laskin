import { useStore } from '../../store/useStore';
import SessionBar from './SessionBar';

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'layout', label: 'Layout' },
  { id: 'investments', label: 'Investoinnit' },
  { id: 'ded', label: 'Meltio DED' },
  { id: 'fastems', label: 'FASTEMS' },
  { id: 'odoo', label: 'Odoo ERP' },
  { id: 'quality', label: 'Datan keruu' },
];

export default function Navbar() {
  const { activeTab, setActiveTab, onlineUsers } = useStore();

  return (
    <nav className="bg-gray-950 border-b border-gray-800 sticky top-0 z-50">
      <div className="flex items-center px-3 h-14 gap-2">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-3 shrink-0">
          <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center shrink-0">
            <span className="text-gray-950 font-bold text-xs">FL</span>
          </div>
          <div className="hidden lg:block">
            <div className="text-xs font-bold text-white leading-tight">TAMK FieldLab</div>
            <div className="text-[10px] text-gray-500 leading-tight">HMLV Production</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 overflow-x-auto flex-1 min-w-0">
          {tabs.map((tab) => {
            // Show a dot if someone else is on this tab
            const othersHere = onlineUsers.filter((u) => u.activeTab === tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-800 text-yellow-400 border border-yellow-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                {tab.label}
                {/* Presence dots */}
                {othersHere.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex gap-0.5">
                    {othersHere.slice(0, 3).map((u) => (
                      <span
                        key={u.name}
                        className="w-2 h-2 rounded-full ring-1 ring-gray-950"
                        style={{ backgroundColor: u.color }}
                        title={u.name}
                      />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Session bar (online users + session code) */}
        <SessionBar />
      </div>
    </nav>
  );
}
