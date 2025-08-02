import React, { useState } from 'react';
import { BarChart3, Plus, RefreshCw } from 'lucide-react';
import TransactionForm from './TransactionForm';
import RecurringPaymentForm from './RecurringPaymentForm';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showRecurringForm, setShowRecurringForm] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'recurring', label: 'Pagos Recurrentes', icon: RefreshCw },
  ];

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Título */}
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Finanzas Personales
              </h1>
            </div>

            {/* Navegación principal */}
            <div className="hidden md:flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Botones de acción */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowTransactionForm(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nueva Transacción</span>
              </button>

              <button
                onClick={() => setShowRecurringForm(true)}
                className="btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Pago Recurrente</span>
              </button>
            </div>
          </div>

          {/* Navegación móvil */}
          <div className="md:hidden border-t border-gray-200">
            <div className="flex space-x-1 py-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex-1 flex flex-col items-center py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mb-1" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Formularios modales */}
      <TransactionForm
        isOpen={showTransactionForm}
        onClose={() => setShowTransactionForm(false)}
      />

      <RecurringPaymentForm
        isOpen={showRecurringForm}
        onClose={() => setShowRecurringForm(false)}
      />
    </>
  );
};

export default Navigation; 