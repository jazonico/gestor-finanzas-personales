import React from 'react';
import { useFinancialContext } from '../context/FinancialContext';
import { dateUtils } from '../utils/dateUtils';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import FinancialChart from './FinancialChart';
import TransactionList from './TransactionList';
import CategoryBreakdown from './CategoryBreakdown';

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
  const { currentMonth: monthData, previousMonth, yearToDate } = summary;

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
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Ingresos</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(monthData.totalIncome)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                {React.createElement(getChangeIndicator(monthData.totalIncome, previousMonth.totalIncome).icon, {
                  className: `w-6 h-6 ${getChangeIndicator(monthData.totalIncome, previousMonth.totalIncome).color}`
                })}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              vs mes anterior: {formatCurrency(previousMonth.totalIncome)}
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Gastos</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(monthData.totalExpenses)}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                {React.createElement(getChangeIndicator(monthData.totalExpenses, previousMonth.totalExpenses).icon, {
                  className: `w-6 h-6 ${getChangeIndicator(monthData.totalExpenses, previousMonth.totalExpenses).color}`
                })}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              vs mes anterior: {formatCurrency(previousMonth.totalExpenses)}
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Balance</p>
                <p className={`text-2xl font-bold ${getBalanceColor(monthData.balance)}`}>
                  {formatCurrency(monthData.balance)}
                </p>
              </div>
              <div className={`p-3 rounded-full ${monthData.balance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign className={`w-6 h-6 ${getBalanceColor(monthData.balance)}`} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              vs mes anterior: {formatCurrency(previousMonth.balance)}
            </p>
          </div>
        </div>

        {/* Gráficos y análisis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Tendencia Mensual
            </h3>
            <FinancialChart />
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Distribución por Categorías
            </h3>
            <CategoryBreakdown summary={summary} />
          </div>
        </div>

        {/* Resumen anual */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Resumen del Año {currentMonth.getFullYear()}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Ingresos</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(yearToDate.totalIncome)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Gastos</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(yearToDate.totalExpenses)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Balance Anual</p>
              <p className={`text-xl font-bold ${getBalanceColor(yearToDate.balance)}`}>
                {formatCurrency(yearToDate.balance)}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de transacciones */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Transacciones del Mes
          </h3>
          <TransactionList transactions={monthData.transactions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 