import { useState, useEffect, useCallback } from 'react';
import { Transaction, RecurringPayment, MonthlyData, FinancialSummary, CategorySummary } from '../types';
import { storageUtils } from '../utils/storage';
import { dateUtils } from '../utils/dateUtils';
import { getCategoryColor } from '../utils/categories';
import { isSameMonth, startOfYear, endOfYear } from 'date-fns';

export const useFinancialData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedTransactions = storageUtils.getTransactions();
        const storedRecurringPayments = storageUtils.getRecurringPayments();
        
        setTransactions(storedTransactions);
        setRecurringPayments(storedRecurringPayments);
        
        // Procesar pagos recurrentes automáticos
        await processRecurringPayments(storedRecurringPayments, storedTransactions);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Procesar pagos recurrentes
  const processRecurringPayments = async (payments: RecurringPayment[], existingTransactions: Transaction[]) => {
    const today = new Date();
    const newTransactions: Transaction[] = [];

    payments.forEach(payment => {
      if (!payment.isActive) return;

      // Verificar si ya existe una transacción para este pago en el mes actual
      const existingTransaction = existingTransactions.find(t => 
        t.isRecurring && 
        t.category === payment.category &&
        t.amount === payment.amount &&
        isSameMonth(t.date, today)
      );

      if (!existingTransaction && today.getDate() >= payment.dayOfMonth) {
        const recurringTransaction: Transaction = {
          id: dateUtils.generateId(),
          type: payment.type,
          category: payment.category,
          amount: payment.amount,
          description: `${payment.name} (Pago automático)`,
          date: new Date(today.getFullYear(), today.getMonth(), payment.dayOfMonth),
          isRecurring: true,
          recurringDay: payment.dayOfMonth
        };

        newTransactions.push(recurringTransaction);
      }
    });

    if (newTransactions.length > 0) {
      const updatedTransactions = [...existingTransactions, ...newTransactions];
      setTransactions(updatedTransactions);
      storageUtils.saveTransactions(updatedTransactions);
    }
  };

  // Agregar transacción
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: dateUtils.generateId(),
    };

    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    storageUtils.addTransaction(newTransaction);
  }, [transactions]);

  // Actualizar transacción
  const updateTransaction = useCallback((id: string, updatedTransaction: Partial<Transaction>) => {
    const updatedTransactions = transactions.map(t => 
      t.id === id ? { ...t, ...updatedTransaction } : t
    );
    setTransactions(updatedTransactions);
    storageUtils.updateTransaction(id, updatedTransaction);
  }, [transactions]);

  // Eliminar transacción
  const deleteTransaction = useCallback((id: string) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    storageUtils.deleteTransaction(id);
  }, [transactions]);

  // Agregar pago recurrente
  const addRecurringPayment = useCallback((payment: Omit<RecurringPayment, 'id'>) => {
    const newPayment: RecurringPayment = {
      ...payment,
      id: dateUtils.generateId(),
    };

    const updatedPayments = [...recurringPayments, newPayment];
    setRecurringPayments(updatedPayments);
    storageUtils.addRecurringPayment(newPayment);
  }, [recurringPayments]);

  // Actualizar pago recurrente
  const updateRecurringPayment = useCallback((id: string, updatedPayment: Partial<RecurringPayment>) => {
    const updatedPayments = recurringPayments.map(p => 
      p.id === id ? { ...p, ...updatedPayment } : p
    );
    setRecurringPayments(updatedPayments);
    storageUtils.updateRecurringPayment(id, updatedPayment);
  }, [recurringPayments]);

  // Eliminar pago recurrente
  const deleteRecurringPayment = useCallback((id: string) => {
    const updatedPayments = recurringPayments.filter(p => p.id !== id);
    setRecurringPayments(updatedPayments);
    storageUtils.deleteRecurringPayment(id);
  }, [recurringPayments]);

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

  return {
    transactions,
    recurringPayments,
    currentMonth,
    loading,
    setCurrentMonth,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addRecurringPayment,
    updateRecurringPayment,
    deleteRecurringPayment,
    getCurrentMonthData,
    getFinancialSummary,
  };
}; 