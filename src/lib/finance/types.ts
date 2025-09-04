/**
 * Tipos base para el sistema de gestión de ingresos
 */

export interface Category {
  id: string;
  name: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IncomeMatrix {
  [categoryId: string]: {
    [month: number]: number; // 1-12
  };
}

export interface YearMatrix {
  [year: number]: IncomeMatrix;
}

export interface MonthlyTotals {
  [month: number]: number; // 1-12
}

export interface CategoryTotals {
  [categoryId: string]: number;
}

export interface FinanceState {
  incomeCategories: Category[];
  incomeMatrix: YearMatrix;
  selectedYear: number;
  isLoading: boolean;
  error: string | null;
}

export interface IncomeEvent {
  type: 'income/updated' | 'income/category/added' | 'income/category/deleted' | 'income/category/renamed';
  payload: {
    year?: number;
    categoryId?: string;
    month?: number;
    value?: number;
    categoryName?: string;
  };
}

export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export const MONTHS: Record<Month, string> = {
  1: 'Ene',
  2: 'Feb', 
  3: 'Mar',
  4: 'Abr',
  5: 'May',
  6: 'Jun',
  7: 'Jul',
  8: 'Ago',
  9: 'Sep',
  10: 'Oct',
  11: 'Nov',
  12: 'Dic'
};

export const MONTHS_FULL: Record<Month, string> = {
  1: 'Enero',
  2: 'Febrero',
  3: 'Marzo', 
  4: 'Abril',
  5: 'Mayo',
  6: 'Junio',
  7: 'Julio',
  8: 'Agosto',
  9: 'Septiembre',
  10: 'Octubre',
  11: 'Noviembre',
  12: 'Diciembre'
};