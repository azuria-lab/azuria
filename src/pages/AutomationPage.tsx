
import { Helmet } from 'react-helmet-async';
import AutomationDashboard from '@/components/automation/AutomationDashboard';

export default function AutomationPage() {
  return (
    <>
      <Helmet>
        <title>Automações - Azuria+</title>
        <meta name="description" content="Sistema completo de automações com regras personalizadas, alertas inteligentes e workflows automatizados." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
          <AutomationDashboard />
      </div>
    </>
  );
}
