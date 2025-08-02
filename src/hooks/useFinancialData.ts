import { useState, useEffect, useCallback } from 'react';
import { Transaction, RecurringPayment, MonthlyData, FinancialSummary, CategorySummary } from '../types';
import { supabaseStorage } from '../utils/supabaseStorage';
import { dateUtils } from '../utils/dateUtils';
import { getCategoryColor } from '../utils/categories';
import { isSameMonth, startOfYear, endOfYear } from 'date-fns';

export const useFinancialData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [storedTransactions, storedRecurringPayments] = await Promise.all([
          supabaseStorage.getTransactions(),
          supabaseStorage.getRecurringPayments()
        ]);
        
        setTransactions(storedTransactions);
        setRecurringPayments(storedRecurringPayments);
        
        // Procesar pagos recurrentes automáticos
        await processRecurringPayments(storedRecurringPayments, storedTransactions);
      } catch (err: any) {
        console.error('Error cargando datos:', err);
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Procesar pagos recurrentes
  const processRecurringPayments = async (payments: RecurringPayment[], existingTransactions: Transaction[]) => {
    try {
      const today = new Date();
      const newTransactions: Transaction[] = [];

      for (const payment of payments) {
        if (!payment.isActive) continue;

        // Verificar si ya existe una transacción para este pago en el mes actual
        const existingTransaction = existingTransactions.find(t => 
          t.isRecurring && 
          t.category === payment.category &&
          t.amount === payment.amount &&
          isSameMonth(t.date, today)
        );

        if (!existingTransaction && today.getDate() >= payment.dayOfMonth) {
          const recurringTransaction: Omit<Transaction, 'id'> = {
            type: payment.type,
            category: payment.category,
            amount: payment.amount,
            description: `${payment.name} (Pago automático)`,
            date: new Date(today.getFullYear(), today.getMonth(), payment.dayOfMonth),
            isRecurring: true,
            recurringDay: payment.dayOfMonth
          };

          const newTransaction = await supabaseStorage.addTransaction(recurringTransaction);
          newTransactions.push(newTransaction);
        }
      }

      if (newTransactions.length > 0) {
        setTransactions(prev => [...prev, ...newTransactions]);
      }
    } catch (err) {
      console.error('Error procesando pagos recurrentes:', err);
    }
  };

  // Agregar transacción
  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const newTransaction = await supabaseStorage.addTransaction(transaction);
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err: any) {
      setError(err.message || 'Error al agregar transacción');
      throw err;
    }
  }, []);

  // Actualizar transacción
  const updateTransaction = useCallback(async (id: string, updatedTransaction: Partial<Transaction>) => {
    try {
      const updated = await supabaseStorage.updateTransaction(id, updatedTransaction);
      setTransactions(prev => prev.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar transacción');
      throw err;
    }
  }, []);

  // Eliminar transacción
  const deleteTransaction = useCallback(async (id: string) => {
    try {
      await supabaseStorage.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      setError(err.message || 'Error al eliminar transacción');
      throw err;
    }
  }, []);

  // Agregar pago recurrente
  const addRecurringPayment = useCallback(async (payment: Omit<RecurringPayment, 'id'>) => {
    try {
      const newPayment = await supabaseStorage.addRecurringPayment(payment);
      setRecurringPayments(prev => [...prev, newPayment]);
      return newPayment;
    } catch (err: any) {
      setError(err.message || 'Error al agregar pago recurrente');
      throw err;
    }
  }, []);

  // Actualizar pago recurrente
  const updateRecurringPayment = useCallback(async (id: string, updatedPayment: Partial<RecurringPayment>) => {
    try {
      const updated = await supabaseStorage.updateRecurringPayment(id, updatedPayment);
      setRecurringPayments(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar pago recurrente');
      throw err;
    }
  }, []);

  // Eliminar pago recurrente
  const deleteRecurringPayment = useCallback(async (id: string) => {
    try {
      await supabaseStorage.deleteRecurringPayment(id);
      setRecurringPayments(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.message || 'Error al eliminar pago recurrente');
      throw err;
    }
  }, []);

  // Obtener datos del mes actual
  const getCurrentMonthData = useCallback((): MonthlyData => {
    const monthTransactions = transactions.filter(t => 
      isSameMonth(t.date, currentMonth)
    );

    const totalIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      month: dateUtils.formatMonth(currentMonth),
      year: currentMonth.getFullYear(),
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactions: monthTransactions,
    };
  }, [transactions, currentMonth]);

  // Obtener resumen financiero completo
  const getFinancialSummary = useCallback((): FinancialSummary => {
    const currentMonthData = getCurrentMonthData();
    const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    
    const previousMonthTransactions = transactions.filter(t => 
      isSameMonth(t.date, previousMonth)
    );

    const previousMonthData: MonthlyData = {
      month: dateUtils.formatMonth(previousMonth),
      year: previousMonth.getFullYear(),
      totalIncome: previousMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: previousMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
      balance: 0,
      transactions: previousMonthTransactions,
    };
    previousMonthData.balance = previousMonthData.totalIncome - previousMonthData.totalExpenses;

    // Datos del año
    const yearStart = startOfYear(currentMonth);
    const yearEnd = endOfYear(currentMonth);
    const yearTransactions = transactions.filter(t => 
      t.date >= yearStart && t.date <= yearEnd
    );

    const yearTotalIncome = yearTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const yearTotalExpenses = yearTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Categorías del mes actual
    const expenseCategories = new Map<string, number>();
    const incomeCategories = new Map<string, number>();

    currentMonthData.transactions.forEach(t => {
      if (t.type === 'expense') {
        expenseCategories.set(t.category, (expenseCategories.get(t.category) || 0) + t.amount);
      } else {
        incomeCategories.set(t.category, (incomeCategories.get(t.category) || 0) + t.amount);
      }
    });

    const createCategorySummary = (categories: Map<string, number>, total: number, type: 'income' | 'expense'): CategorySummary[] => {
      return Array.from(categories.entries()).map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color: getCategoryColor(category, type),
      })).sort((a, b) => b.amount - a.amount);
    };

    return {
      currentMonth: currentMonthData,
      previousMonth: previousMonthData,
      yearToDate: {
        totalIncome: yearTotalIncome,
        totalExpenses: yearTotalExpenses,
        balance: yearTotalIncome - yearTotalExpenses,
      },
      categoryBreakdown: {
        expenses: createCategorySummary(expenseCategories, currentMonthData.totalExpenses, 'expense'),
        income: createCategorySummary(incomeCategories, currentMonthData.totalIncome, 'income'),
      },
    };
  }, [transactions, currentMonth, getCurrentMonthData]);

  // Función para refrescar datos
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [newTransactions, newRecurringPayments] = await Promise.all([
        supabaseStorage.getTransactions(),
        supabaseStorage.getRecurringPayments()
      ]);
      
      setTransactions(newTransactions);
      setRecurringPayments(newRecurringPayments);
    } catch (err: any) {
      setError(err.message || 'Error al refrescar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    transactions,
    recurringPayments,
    currentMonth,
    loading,
    error,
    setCurrentMonth,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addRecurringPayment,
    updateRecurringPayment,
    deleteRecurringPayment,
    getCurrentMonthData,
    getFinancialSummary,
    refreshData,
  };
}; 