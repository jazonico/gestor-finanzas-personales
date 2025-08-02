import React, { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { FinancialSummary } from '../types';
import { getCategoryIcon } from '../utils/categories';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryBreakdownProps {
  summary: FinancialSummary;
}

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ summary }) => {
  const [activeTab, setActiveTab] = useState<'expenses' | 'income'>('expenses');

  const { categoryBreakdown } = summary;
  const activeData = activeTab === 'expenses' ? categoryBreakdown.expenses : categoryBreakdown.income;

  const chartData = {
    labels: activeData.map(cat => cat.category),
    datasets: [
      {
        data: activeData.map(cat => cat.amount),
        backgroundColor: activeData.map(cat => cat.color),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed;
            const percentage = ((value / activeData.reduce((sum, cat) => sum + cat.amount, 0)) * 100).toFixed(1);
            return `${new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 0,
            }).format(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (activeData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          No hay {activeTab === 'expenses' ? 'gastos' : 'ingresos'} registrados este mes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'expenses'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Gastos
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'income'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Ingresos
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico */}
        <div className="h-48">
          <Doughnut data={chartData} options={options} />
        </div>

        {/* Lista de categorías */}
        <div className="space-y-2">
          {activeData.map((category) => (
            <div
              key={category.category}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm">
                  {getCategoryIcon(category.category, activeTab === 'expenses' ? 'expense' : 'income')} {category.category}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {formatCurrency(category.amount)}
                </p>
                <p className="text-xs text-gray-500">
                  {category.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryBreakdown; 