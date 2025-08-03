import { useState, useEffect, useCallback } from 'react';
import { SharedExpense, SharedExpenseBalance } from '../types';
import { supabaseStorage } from '../utils/supabaseStorage';

export const useSharedExpenses = () => {
  const [expenses, setExpenses] = useState<SharedExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonth = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const loadExpenses = useCallback(async (month?: Date) => {
    try {
      setLoading(true);
      setError(null);
      const data = await supabaseStorage.getSharedExpenses(month);
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar gastos');
      console.error('Error loading shared expenses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addExpense = async (expense: Omit<SharedExpense, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const newExpenses = await supabaseStorage.addSharedExpense(expense);
      await loadExpenses(currentMonth);
      return newExpenses;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar gasto');
      throw err;
    }
  };

  const updateExpense = async (id: string, updates: Partial<SharedExpense>) => {
    try {
      setError(null);
      const updatedExpense = await supabaseStorage.updateSharedExpense(id, updates);
      await loadExpenses(currentMonth);
      return updatedExpense;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar gasto');
      throw err;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      setError(null);
      await supabaseStorage.deleteSharedExpense(id);
      await loadExpenses(currentMonth);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar gasto');
      throw err;
    }
  };

  const calculateBalance = useCallback((expenses: SharedExpense[]): SharedExpenseBalance => {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const felipePaid = expenses.filter(e => e.paidBy === 'Felipe').reduce((sum, e) => sum + e.amount, 0);
    const camilaPaid = expenses.filter(e => e.paidBy === 'Camila').reduce((sum, e) => sum + e.amount, 0);

    let felipeOwes = 0;
    let camilaOwes = 0;

    expenses.forEach(expense => {
      if (expense.isShared) {
        const felipeShare = Math.round(expense.amount * (expense.sharedPercentage / 100));
        const camilaShare = expense.amount - felipeShare;

        if (expense.paidBy === 'Felipe') {
          camilaOwes += camilaShare;
        } else {
          felipeOwes += felipeShare;
        }
      }
    });

    const netBalance = felipeOwes - camilaOwes;
    const whoOwes: 'Felipe' | 'Camila' | 'balanced' = 
      netBalance > 0 ? 'Felipe' : netBalance < 0 ? 'Camila' : 'balanced';
    const amountOwed = Math.abs(netBalance);

    const monthKey = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}`;

    return {
      month: monthKey,
      totalExpenses,
      felipePaid,
      camilaPaid,
      felipeOwes,
      camilaOwes,
      netBalance,
      whoOwes,
      amountOwed,
    };
  }, [currentMonth]);

  const goToPreviousMonth = () => {
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(prevMonth);
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(nextMonth);
  };

  const refreshData = () => {
    loadExpenses(currentMonth);
  };

  useEffect(() => {
    loadExpenses(currentMonth);
  }, [currentMonth, loadExpenses]);

  const balance = calculateBalance(expenses);

  return {
    expenses,
    loading,
    error,
    currentMonth,
    balance,
    formatCurrency,
    formatMonth,
    addExpense,
    updateExpense,
    deleteExpense,
    goToPreviousMonth,
    goToNextMonth,
    refreshData,
  };
}; 