import { useStore } from '../../store/useStore';

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'layout', label: 'Layout-suunnitelma' },
  { id: 'investments', label: 'Investointilaskin' },
  { id: 'ded', label: 'Meltio DED' },
  { id: 'fastems', label: 'FASTEMS MMS' },
  { id: 'odoo', label: 'Odoo ERP' },
  { id: 'quality', label: 'Datan keruu & laatu' },
];

export default function Navbar() {
  const { activeTab, setActiveTab } = useStore();

  return (
    <nav className="bg-gray-950 border-b border-gray-800 sticky top-0 z-50">
      <div className="flex items-center px-4 h-14 gap-2">
        <div className="flex items-center gap-2 mr-4 shrink-0">
          <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center">
            <span className="text-gray-950 font-bold text-xs">FL</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold text-white leading-tight">TAMK FieldLab</div>
            <div className="text-xs text-gray-500 leading-tight">HMLV Production</div>
          </div>
        </div>

        <div className="flex gap-0.5 overflow-x-auto scrollbar-hide flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-800 text-yellow-400 border border-yellow-500/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
