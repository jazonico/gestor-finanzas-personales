/**
 * Hook para obtener totales y estadísticas de ingresos
 */

import { useMemo } from 'react';
import { useFinanceStore, getMonthlyTotals, getAnnualTotalsByCategory, getGrandTotal } from '@/store/useFinanceStore';
import { MonthlyTotals, CategoryTotals, MONTHS } from '@/lib/finance/types';

export interface UseIncomeTotalsReturn {
  monthlyTotals: MonthlyTotals;
  categoryTotals: CategoryTotals;
  grandTotal: number;
  
  // Estadísticas adicionales
  averageMonthly: number;
  highestMonth: { month: number; monthName: string; value: number };
  lowestMonth: { month: number; monthName: string; value: number };
  topCategories: Array<{ categoryId: string; categoryName: string; total: number; percentage: number }>;
  
  // Utilidades
  getMonthTotal: (month: number) => number;
  getCategoryTotal: (categoryId: string) => number;
  getCategoryPercentage: (categoryId: string) => number;
}

export function useIncomeTotals(year: number): UseIncomeTotalsReturn {
  const { incomeCategories } = useFinanceStore();
  
  // Obtener totales usando selectores memoizados
  const monthlyTotals = useFinanceStore(getMonthlyTotals(year));
  const categoryTotals = useFinanceStore(getAnnualTotalsByCategory(year));
  const grandTotal = useFinanceStore(getGrandTotal(year));

  // Estadísticas calculadas
  const statistics = useMemo(() => {
    // Promedio mensual
    const monthsWithData = Object.values(monthlyTotals).filter(value => value > 0).length;
    const averageMonthly = monthsWithData > 0 ? grandTotal / monthsWithData : 0;

    // Mes más alto y más bajo (solo considerando meses con datos)
    const monthEntries = Object.entries(monthlyTotals)
      .map(([month, value]) => ({ month: parseInt(month), value }))
      .filter(entry => entry.value > 0);

    let highestMonth = { month: 1, monthName: MONTHS[1], value: 0 };
    let lowestMonth = { month: 1, monthName: MONTHS[1], value: Infinity };

    monthEntries.forEach(({ month, value }) => {
      if (value > highestMonth.value) {
        highestMonth = { month, monthName: MONTHS[month as keyof typeof MONTHS], value };
      }
      if (value < lowestMonth.value) {
        lowestMonth = { month, monthName: MONTHS[month as keyof typeof MONTHS], value };
      }
    });

    // Si no hay datos, resetear el mes más bajo
    if (lowestMonth.value === Infinity) {
      lowestMonth = { month: 1, monthName: MONTHS[1], value: 0 };
    }

    // Top categorías con porcentajes
    const topCategories = Object.entries(categoryTotals)
      .map(([categoryId, total]) => {
        const category = incomeCategories.find(cat => cat.id === categoryId);
        return {
          categoryId,
          categoryName: category?.name || 'Categoría desconocida',
          total,
          percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
        };
      })
      .filter(item => item.total > 0)
      .sort((a, b) => b.total - a.total);

    return {
      averageMonthly,
      highestMonth,
      lowestMonth,
      topCategories,
    };
  }, [monthlyTotals, categoryTotals, grandTotal, incomeCategories]);

  // Funciones utilitarias
  const getMonthTotal = (month: number): number => {
    return monthlyTotals[month] || 0;
  };

  const getCategoryTotal = (categoryId: string): number => {
    return categoryTotals[categoryId] || 0;
  };

  const getCategoryPercentage = (categoryId: string): number => {
    if (grandTotal === 0) return 0;
    const categoryTotal = getCategoryTotal(categoryId);
    return (categoryTotal / grandTotal) * 100;
  };

  return {
    monthlyTotals,
    categoryTotals,
    grandTotal,
    
    // Estadísticas
    ...statistics,
    
    // Utilidades
    getMonthTotal,
    getCategoryTotal,
    getCategoryPercentage,
  };
}
