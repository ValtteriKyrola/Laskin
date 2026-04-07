import './index.css';
import { useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import BottomTabBar from './components/layout/BottomTabBar';
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

function AppInner() {
  useSession();
  useRealtime();
  usePresence();

  const { activeTab, isDark } = useStore();

  // Apply dark class on body on mount
  useEffect(() => {
    if (isDark) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }, [isDark]);

  const Page = pages[activeTab] ?? Dashboard;

  return (
    <div className="flex min-h-screen bg-neutral-100 dark:bg-neutral-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto pb-16 lg:pb-0">
          <Page />
        </main>
      </div>
      <BottomTabBar />
      <ToastProvider />
    </div>
  );
}

export default function App() {
  return <AppInner />;
}
