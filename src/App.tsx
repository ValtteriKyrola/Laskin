import './index.css';
import Navbar from './components/layout/Navbar';
import { useStore } from './store/useStore';
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

export default function App() {
  const { activeTab } = useStore();
  const Page = pages[activeTab] ?? Dashboard;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />
      <main>
        <Page />
      </main>
    </div>
  );
}
