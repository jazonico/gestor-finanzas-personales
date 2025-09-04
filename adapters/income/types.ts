/**
 * Tipos e interfaces para los adapters de datos de ingresos
 */

import { Category, IncomeMatrix } from '@/lib/finance/types';

export interface IncomeDataAdapter {
  // Gestión de categorías
  listCategories(): Promise<Category[]>;
  createCategory(name: string): Promise<Category>;
  renameCategory(id: string, name: string): Promise<void>;
  deleteCategory(id: string): Promise<void>;
  reorderCategories(order: string[]): Promise<void>;

  // Gestión de matriz de ingresos
  getMatrix(year: number): Promise<IncomeMatrix>;
  setCell(year: number, categoryId: string, month: number, value: number): Promise<void>;
  bulkSetRow(year: number, categoryId: string, valuesByMonth: Record<number, number>): Promise<void>;
  
  // Utilidades
  initialize(): Promise<void>;
  reset(): Promise<void>;
}

export interface AdapterError extends Error {
  code: string;
  details?: any;
}

export class AdapterError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = 'AdapterError';
  }
}
