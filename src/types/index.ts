export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: Date;
  isRecurring?: boolean;
  recurringDay?: number; // día del mes para pagos recurrentes
}

export interface RecurringPayment {
  id: string;
  name: string;
  amount: number;
  category: string;
  dayOfMonth: number;
  isActive: boolean;
  type: 'expense' | 'income';
}

export interface MonthlyData {
  month: string;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactions: Transaction[];
}

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface FinancialSummary {
  currentMonth: MonthlyData;
  previousMonth: MonthlyData;
  yearToDate: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
  };
  categoryBreakdown: {
    expenses: CategorySummary[];
    income: CategorySummary[];
  };
}

export interface SharedExpense {
  id: string;
  description: string;
  amount: number; // en CLP
  date: Date;
  paidBy: 'Felipe' | 'Camila';
  isShared: boolean;
  sharedPercentage: number; // 0-100
  hasInstallments: boolean;
  installmentsTotal?: number;
  installmentNumber?: number; // Para identificar cuotas
  parentExpenseId?: string; // Para agrupar cuotas
  createdAt: Date;
  updatedAt: Date;
}

export interface SharedExpenseBalance {
  month: string; // YYYY-MM
  totalExpenses: number;
  felipePaid: number;
  camilaPaid: number;
  felipeOwes: number;
  camilaOwes: number;
  netBalance: number; // positivo = Felipe debe a Camila, negativo = Camila debe a Felipe
  whoOwes: 'Felipe' | 'Camila' | 'balanced';
  amountOwed: number;
} 