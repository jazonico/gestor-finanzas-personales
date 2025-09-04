/**
 * Hook personalizado para gestión de la matriz de ingresos
 */

import { useCallback, useEffect } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Category, IncomeMatrix } from '../lib/finance/types';
import { parseCLP, parseExcelValues } from '../utils/currency';

export interface UseIncomeMatrixReturn {
  // Estado
  categories: Category[];
  matrix: IncomeMatrix;
  isLoading: boolean;
  error: string | null;
  
  // Acciones de categorías
  createCategory: (name: string) => Promise<Category>;
  renameCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Acciones de matriz
  setCell: (categoryId: string, month: number, value: number) => Promise<void>;
  setCellFromString: (categoryId: string, month: number, valueStr: string) => Promise<void>;
  bulkSetRow: (categoryId: string, valuesByMonth: Record<number, number>) => Promise<void>;
  pasteExcelRow: (categoryId: string, values: string[]) => Promise<void>;
  
  // Utilidades
  getCellValue: (categoryId: string, month: number) => number;
  clearError: () => void;
}

export function useIncomeMatrix(year: number): UseIncomeMatrixReturn {
  const {
    incomeCategories,
    incomeMatrix,
    isLoading,
    error,
    setYear,
    createCategory: storeCreateCategory,
    renameCategory: storeRenameCategory,
    deleteCategory: storeDeleteCategory,
    setCell: storeSetCell,
    bulkSetRow: storeBulkSetRow,
    setError,
  } = useFinanceStore();

  // Cargar datos para el año seleccionado
  useEffect(() => {
    setYear(year);
  }, [year, setYear]);

  // Obtener matriz del año actual
  const matrix = incomeMatrix[year] || {};

  // Acciones de categorías
  const createCategory = useCallback(async (name: string) => {
    return await storeCreateCategory(name.trim());
  }, [storeCreateCategory]);

  const renameCategory = useCallback(async (id: string, name: string) => {
    await storeRenameCategory(id, name.trim());
  }, [storeRenameCategory]);

  const deleteCategory = useCallback(async (id: string) => {
    if (incomeCategories.length <= 1) {
      throw new Error('No puedes eliminar la única categoría');
    }
    await storeDeleteCategory(id);
  }, [storeDeleteCategory, incomeCategories.length]);

  // Acciones de matriz
  const setCell = useCallback(async (categoryId: string, month: number, value: number) => {
    await storeSetCell(year, categoryId, month, Math.max(0, Math.round(value)));
  }, [storeSetCell, year]);

  const setCellFromString = useCallback(async (categoryId: string, month: number, valueStr: string) => {
    const value = parseCLP(valueStr);
    await setCell(categoryId, month, value);
  }, [setCell]);

  const bulkSetRow = useCallback(async (categoryId: string, valuesByMonth: Record<number, number>) => {
    // Sanitizar valores
    const sanitizedValues: Record<number, number> = {};
    for (const [monthStr, value] of Object.entries(valuesByMonth)) {
      const month = parseInt(monthStr);
      if (month >= 1 && month <= 12) {
        sanitizedValues[month] = Math.max(0, Math.round(value));
      }
    }
    
    await storeBulkSetRow(year, categoryId, sanitizedValues);
  }, [storeBulkSetRow, year]);

  const pasteExcelRow = useCallback(async (categoryId: string, values: string[]) => {
    const parsedValues = parseExcelValues(values.slice(0, 12)); // Máximo 12 meses
    const valuesByMonth: Record<number, number> = {};
    
    parsedValues.forEach((value, index) => {
      const month = index + 1;
      if (month <= 12 && value > 0) {
        valuesByMonth[month] = value;
      }
    });

    await bulkSetRow(categoryId, valuesByMonth);
  }, [bulkSetRow]);

  // Utilidades
  const getCellValue = useCallback((categoryId: string, month: number): number => {
    return matrix[categoryId]?.[month] || 0;
  }, [matrix]);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    // Estado
    categories: incomeCategories,
    matrix,
    isLoading,
    error,
    
    // Acciones de categorías
    createCategory,
    renameCategory,
    deleteCategory,
    
    // Acciones de matriz
    setCell,
    setCellFromString,
    bulkSetRow,
    pasteExcelRow,
    
    // Utilidades
    getCellValue,
    clearError,
  };
}
