import { useState } from 'react';
import { FinancialProvider } from './context/FinancialContext';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import RecurringPaymentsList from './components/RecurringPaymentsList';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'recurring':
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Pagos Recurrentes
                </h1>
                <p className="text-gray-600">
                  Gestiona tus pagos automáticos mensuales como alquiler, tarjetas de crédito, servicios y salarios.
                </p>
              </div>
              
              <div className="card">
                <RecurringPaymentsList />
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <FinancialProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        {renderContent()}
      </div>
    </FinancialProvider>
  );
}

export default App; 