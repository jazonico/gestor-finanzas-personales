import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useFinancialContext } from '../context/FinancialContext';
import { dateUtils } from '../utils/dateUtils';
import { isSameMonth, subMonths } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const FinancialChart: React.FC = () => {
  const { transactions, currentMonth } = useFinancialContext();

  const chartData = useMemo(() => {
    // Obtener los últimos 6 meses
    const months = [];
    for (let i = 5; i >= 0; i--) {
      months.push(subMonths(currentMonth, i));
    }

    const monthlyData = months.map(month => {
      const monthTransactions = transactions.filter(t => 
        isSameMonth(t.date, month)
      );

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: dateUtils.formatMonthShort(month),
        income,
        expenses,
        balance: income - expenses,
      };
    });

    return {
      labels: monthlyData.map(d => d.month),
      datasets: [
        {
          label: 'Ingresos',
          data: monthlyData.map(d => d.income),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Gastos',
          data: monthlyData.map(d => d.expenses),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Balance',
          data: monthlyData.map(d => d.balance),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
      ],
    };
  }, [transactions, currentMonth]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 0,
            }).format(value)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-80">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default FinancialChart; 