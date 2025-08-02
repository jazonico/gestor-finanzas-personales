import React, { createContext, useContext, ReactNode } from 'react';
import { useFinancialData } from '../hooks/useFinancialData';
import { Transaction, RecurringPayment, MonthlyData, FinancialSummary } from '../types';

interface FinancialContextType {
  transactions: Transaction[];
  recurringPayments: RecurringPayment[];
  currentMonth: Date;
  loading: boolean;
  setCurrentMonth: (date: Date) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updatedTransaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addRecurringPayment: (payment: Omit<RecurringPayment, 'id'>) => void;
  updateRecurringPayment: (id: string, updatedPayment: Partial<RecurringPayment>) => void;
  deleteRecurringPayment: (id: string) => void;
  getCurrentMonthData: () => MonthlyData;
  getFinancialSummary: () => FinancialSummary;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

interface FinancialProviderProps {
  children: ReactNode;
}

export const FinancialProvider: React.FC<FinancialProviderProps> = ({ children }) => {
  const financialData = useFinancialData();

  return (
    <FinancialContext.Provider value={financialData}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancialContext = (): FinancialContextType => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancialContext debe ser usado dentro de un FinancialProvider');
  }
  return context;
}; 