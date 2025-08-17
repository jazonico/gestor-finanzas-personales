import React from 'react';
import { useFinancialContext } from '../context/FinancialContext';
import { dateUtils } from '../utils/dateUtils';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import FinancialChart from './FinancialChart';
import TransactionList from './TransactionList';
import CategoryBreakdown from './CategoryBreakdown';
import MonthlyTimeline from './MonthlyTimeline';

const Dashboard: React.FC = () => {
  const { 
    currentMonth, 
    setCurrentMonth, 
    getFinancialSummary, 
    loading 
  } = useFinancialContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const summary = getFinancialSummary();
  const { currentMonth: monthData, previousMonth } = summary;

  const goToPreviousMonth = () => {
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(prevMonth);
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(nextMonth);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIndicator = (current: number, previous: number) => {
    if (current > previous) {
      return { icon: TrendingUp, color: 'text-green-500', text: 'Incremento' };
    } else if (current < previous) {
      return { icon: TrendingDown, color: 'text-red-500', text: 'Disminución' };
    }
    return { icon: DollarSign, color: 'text-gray-500', text: 'Sin cambios' };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Gestor de Finanzas Personales
            </h1>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousMonth}
                className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-semibold text-gray-800 min-w-[200px] text-center">
                {dateUtils.formatMonth(currentMonth)}
              </h2>
              
              <button
                onClick={goToNextMonth}
                className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Resumen mensual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(monthData.totalIncome)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {(() => {
                const indicator = getChangeIndicator(monthData.totalIncome, previousMonth.totalIncome);
                return (
                  <>
                    <indicator.icon className={`w-4 h-4 ${indicator.color} mr-1`} />
                    <span className="text-sm text-gray-600">
                      {Math.abs(monthData.totalIncome - previousMonth.totalIncome) > 0 ? 
                        `${formatCurrency(Math.abs(monthData.totalIncome - previousMonth.totalIncome))} vs mes anterior` : 
                        'Sin cambios vs mes anterior'
                      }
                    </span>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gastos</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(monthData.totalExpenses)}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {(() => {
                const indicator = getChangeIndicator(monthData.totalExpenses, previousMonth.totalExpenses);
                return (
                  <>
                    <indicator.icon className={`w-4 h-4 ${indicator.color} mr-1`} />
                    <span className="text-sm text-gray-600">
                      {Math.abs(monthData.totalExpenses - previousMonth.totalExpenses) > 0 ? 
                        `${formatCurrency(Math.abs(monthData.totalExpenses - previousMonth.totalExpenses))} vs mes anterior` : 
                        'Sin cambios vs mes anterior'
                      }
                    </span>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Balance</p>
                <p className={`text-2xl font-bold ${getBalanceColor(monthData.balance)}`}>
                  {formatCurrency(monthData.balance)}
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                monthData.balance > 0 ? 'bg-green-100' : monthData.balance < 0 ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <DollarSign className={`w-6 h-6 ${getBalanceColor(monthData.balance)}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {(() => {
                const indicator = getChangeIndicator(monthData.balance, previousMonth.balance);
                return (
                  <>
                    <indicator.icon className={`w-4 h-4 ${indicator.color} mr-1`} />
                    <span className="text-sm text-gray-600">
                      {Math.abs(monthData.balance - previousMonth.balance) > 0 ? 
                        `${formatCurrency(Math.abs(monthData.balance - previousMonth.balance))} vs mes anterior` : 
                        'Sin cambios vs mes anterior'
                      }
                    </span>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Línea de Tiempo Mensual */}
        <div className="mb-8">
          <MonthlyTimeline />
        </div>

        {/* Gráfico y desglose */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tendencia Mensual
            </h3>
            <FinancialChart />
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribución por Categorías
            </h3>
            <CategoryBreakdown summary={summary} />
          </div>
        </div>

        {/* Lista de transacciones */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Transacciones del Mes
          </h3>
          <TransactionList transactions={monthData.transactions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 