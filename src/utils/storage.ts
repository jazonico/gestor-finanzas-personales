import { Transaction, RecurringPayment } from '../types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'finanzas_transactions',
  RECURRING_PAYMENTS: 'finanzas_recurring_payments',
};

export const storageUtils = {
  // Transacciones
  getTransactions: (): Transaction[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!stored) return [];
    
    const transactions = JSON.parse(stored);
    return transactions.map((t: any) => ({
      ...t,
      date: new Date(t.date)
    }));
  },

  saveTransactions: (transactions: Transaction[]): void => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  addTransaction: (transaction: Transaction): void => {
    const transactions = storageUtils.getTransactions();
    transactions.push(transaction);
    storageUtils.saveTransactions(transactions);
  },

  updateTransaction: (id: string, updatedTransaction: Partial<Transaction>): void => {
    const transactions = storageUtils.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updatedTransaction };
      storageUtils.saveTransactions(transactions);
    }
  },

  deleteTransaction: (id: string): void => {
    const transactions = storageUtils.getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    storageUtils.saveTransactions(filtered);
  },

  // Pagos recurrentes
  getRecurringPayments: (): RecurringPayment[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.RECURRING_PAYMENTS);
    return stored ? JSON.parse(stored) : [];
  },

  saveRecurringPayments: (payments: RecurringPayment[]): void => {
    localStorage.setItem(STORAGE_KEYS.RECURRING_PAYMENTS, JSON.stringify(payments));
  },

  addRecurringPayment: (payment: RecurringPayment): void => {
    const payments = storageUtils.getRecurringPayments();
    payments.push(payment);
    storageUtils.saveRecurringPayments(payments);
  },

  updateRecurringPayment: (id: string, updatedPayment: Partial<RecurringPayment>): void => {
    const payments = storageUtils.getRecurringPayments();
    const index = payments.findIndex(p => p.id === id);
    if (index !== -1) {
      payments[index] = { ...payments[index], ...updatedPayment };
      storageUtils.saveRecurringPayments(payments);
    }
  },

  deleteRecurringPayment: (id: string): void => {
    const payments = storageUtils.getRecurringPayments();
    const filtered = payments.filter(p => p.id !== id);
    storageUtils.saveRecurringPayments(filtered);
  },
}; 