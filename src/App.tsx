import './index.css';
import Navbar from './components/layout/Navbar';
import ToastProvider from './components/shared/ToastProvider';
import { useStore } from './store/useStore';
import { useSession } from './hooks/useSession';
import { useRealtime } from './hooks/useRealtime';
import { usePresence } from './hooks/usePresence';
import Dashboard from './components/dashboard/Dashboard';
import LayoutPlan from './components/layout-plan/LayoutPlan';
import InvestmentCalculator from './components/investments/InvestmentCalculator';
import DEDUseCaseTool from './components/ded-usecase/DEDUseCaseTool';
import FASTEMSTree from './components/fastems/FASTEMSTree';
import OdooERP from './components/odoo/OdooERP';
import DataQuality from './components/quality/DataQuality';

const pages: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  layout: LayoutPlan,
  investments: InvestmentCalculator,
  ded: DEDUseCaseTool,
  fastems: FASTEMSTree,
  odoo: OdooERP,
  quality: DataQuality,
};

// Inner component so hooks run inside store context
function AppInner() {
  useSession();
  useRealtime();
  usePresence();

  const { activeTab } = useStore();
  const Page = pages[activeTab] ?? Dashboard;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />
      <ToastProvider />
      <main>
        <Page />
      </main>
    </div>
  );
}

export default function App() {
  return <AppInner />;
}
