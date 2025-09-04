/**
 * Store global de finanzas con Zustand + event bus + selectores memoizados
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Category, IncomeMatrix, IncomeEvent, MonthlyTotals, CategoryTotals } from '../lib/finance/types';

// Función para generar UUID simple si crypto.randomUUID no está disponible
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback UUID v4 simple
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// LocalStorage adapter simple para el store
class SimpleLocalAdapter {
  private categoriesKey = 'finance_income_categories';
  private matrixKey = 'finance_income_matrix';

  async listCategories(): Promise<Category[]> {
    try {
      const stored = localStorage.getItem(this.categoriesKey);
      const categories: Category[] = stored ? JSON.parse(stored) : [];
      
      return categories.map(cat => ({
        ...cat,
        createdAt: new Date(cat.createdAt),
        updatedAt: new Date(cat.updatedAt),
      })).sort((a, b) => a.order - b.order);
    } catch {
      return [];
    }
  }

  async createCategory(name: string): Promise<Category> {
    const categories = await this.listCategories();
    const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.order)) : -1;
    
    const newCategory: Category = {
      id: generateUUID(),
      name: name.trim(),
      order: maxOrder + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedCategories = [...categories, newCategory];
    localStorage.setItem(this.categoriesKey, JSON.stringify(updatedCategories));
    
    return newCategory;
  }

  async renameCategory(id: string, name: string): Promise<void> {
    const categories = await this.listCategories();
    const categoryIndex = categories.findIndex(c => c.id === id);
    
    if (categoryIndex === -1) throw new Error('Categoría no encontrada');

    categories[categoryIndex] = {
      ...categories[categoryIndex],
      name: name.trim(),
      updatedAt: new Date(),
    };

    localStorage.setItem(this.categoriesKey, JSON.stringify(categories));
  }

  async deleteCategory(id: string): Promise<void> {
    const categories = await this.listCategories();
    const filteredCategories = categories.filter(c => c.id !== id);
    
    if (filteredCategories.length === categories.length) {
      throw new Error('Categoría no encontrada');
    }

    localStorage.setItem(this.categoriesKey, JSON.stringify(filteredCategories));
    
    // Eliminar datos de matriz
    const matrix = await this.getMatrix(new Date().getFullYear());
    delete matrix[id];
    await this.saveMatrix(new Date().getFullYear(), matrix);
  }

  async getMatrix(year: number): Promise<IncomeMatrix> {
    try {
      const key = `${this.matrixKey}_${year}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  async setCell(year: number, categoryId: string, month: number, value: number): Promise<void> {
    const matrix = await this.getMatrix(year);
    
    if (!matrix[categoryId]) {
      matrix[categoryId] = {};
    }
    
    matrix[categoryId][month] = Math.max(0, Math.round(value));
    await this.saveMatrix(year, matrix);
  }

  async bulkSetRow(year: number, categoryId: string, valuesByMonth: Record<number, number>): Promise<void> {
    const matrix = await this.getMatrix(year);
    
    if (!matrix[categoryId]) {
      matrix[categoryId] = {};
    }

    for (const [monthStr, value] of Object.entries(valuesByMonth)) {
      const month = parseInt(monthStr);
      if (month >= 1 && month <= 12) {
        matrix[categoryId][month] = Math.max(0, Math.round(value));
      }
    }

    await this.saveMatrix(year, matrix);
  }

  private async saveMatrix(year: number, matrix: IncomeMatrix): Promise<void> {
    const key = `${this.matrixKey}_${year}`;
    localStorage.setItem(key, JSON.stringify(matrix));
  }

  async initialize(): Promise<void> {
    console.log('🚀 Inicializando SimpleLocalAdapter...');
    
    try {
      const categories = await this.listCategories();
      console.log('📋 Categorías cargadas:', categories.length);
      
      if (categories.length === 0) {
        console.log('🌱 Creando datos de ejemplo...');
        
        // Crear datos de ejemplo
        const seedCategories = ['Sueldo', 'Turnos', 'UMed', 'Arriendos', 'Dividendos'];
        const currentYear = new Date().getFullYear();
        
        for (let i = 0; i < seedCategories.length; i++) {
          console.log(`➕ Creando categoría: ${seedCategories[i]}`);
          await this.createCategory(seedCategories[i]);
        }

        const newCategories = await this.listCategories();
        console.log('✅ Categorías creadas:', newCategories.length);
        
        const currentMonth = new Date().getMonth() + 1;
        
        for (const category of newCategories) {
          for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
            const month = Math.max(1, currentMonth - monthOffset);
            const randomAmount = Math.floor(Math.random() * 500000) + 100000;
            
            console.log(`💰 Agregando ${randomAmount} para ${category.name} en mes ${month}`);
            await this.setCell(currentYear, category.id, month, randomAmount);
          }
        }
        
        console.log('✅ Datos de ejemplo creados exitosamente');
      } else {
        console.log('✅ Datos existentes encontrados');
      }
    } catch (error) {
      console.error('❌ Error en initialize:', error);
      throw error;
    }
  }
}

interface FinanceState {
  // Estado
  incomeCategories: Category[];
  incomeMatrix: Record<number, IncomeMatrix>;
  selectedYear: number;
  isLoading: boolean;
  error: string | null;
  
  // Adapter
  adapter: SimpleLocalAdapter;
  
  // Event bus
  eventListeners: Map<string, ((event: IncomeEvent) => void)[]>;
  
  // Acciones básicas
  setYear: (year: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Acciones de categorías
  loadCategories: () => Promise<void>;
  createCategory: (name: string) => Promise<Category>;
  renameCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Acciones de matriz
  loadMatrix: (year: number) => Promise<void>;
  setCell: (year: number, categoryId: string, month: number, value: number) => Promise<void>;
  bulkSetRow: (year: number, categoryId: string, valuesByMonth: Record<number, number>) => Promise<void>;
  
  // Event bus
  subscribe: (eventType: string, callback: (event: IncomeEvent) => void) => () => void;
  emit: (event: IncomeEvent) => void;
  
  // Inicialización
  initialize: () => Promise<void>;
}

export const useFinanceStore = create<FinanceState>()(
  devtools(
    (set, get) => ({
      // Estado inicial
      incomeCategories: [],
      incomeMatrix: {},
      selectedYear: new Date().getFullYear(),
      isLoading: false,
      error: null,
      adapter: new SimpleLocalAdapter(),
      eventListeners: new Map(),

      // Acciones básicas
      setYear: (year: number) => {
        set({ selectedYear: year });
        get().loadMatrix(year);
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setError: (error: string | null) => set({ error }),

      // Acciones de categorías
      loadCategories: async () => {
        const { adapter, setLoading, setError } = get();
        
        try {
          setLoading(true);
          setError(null);
          
          const categories = await adapter.listCategories();
          set({ incomeCategories: categories });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Error desconocido';
          setError(`Error al cargar categorías: ${message}`);
          throw error;
        } finally {
          setLoading(false);
        }
      },

      createCategory: async (name: string) => {
        const { adapter, setError, emit } = get();
        
        try {
          setError(null);
          
          const newCategory = await adapter.createCategory(name);
          
          set(state => ({
            incomeCategories: [...state.incomeCategories, newCategory]
              .sort((a, b) => a.order - b.order)
          }));

          emit({
            type: 'income/category/added',
            payload: { categoryId: newCategory.id, categoryName: newCategory.name }
          });

          return newCategory;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Error desconocido';
          setError(`Error al crear categoría: ${message}`);
          throw error;
        }
      },

      renameCategory: async (id: string, name: string) => {
        const { adapter, setError, emit } = get();
        
        try {
          setError(null);
          
          await adapter.renameCategory(id, name);
          
          set(state => ({
            incomeCategories: state.incomeCategories.map(cat =>
              cat.id === id ? { ...cat, name, updatedAt: new Date() } : cat
            )
          }));

          emit({
            type: 'income/category/renamed',
            payload: { categoryId: id, categoryName: name }
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Error desconocido';
          setError(`Error al renombrar categoría: ${message}`);
          throw error;
        }
      },

      deleteCategory: async (id: string) => {
        const { adapter, setError, emit } = get();
        
        try {
          setError(null);
          
          await adapter.deleteCategory(id);
          
          set(state => ({
            incomeCategories: state.incomeCategories.filter(cat => cat.id !== id),
            incomeMatrix: Object.fromEntries(
              Object.entries(state.incomeMatrix).map(([year, matrix]) => [
                year,
                Object.fromEntries(
                  Object.entries(matrix).filter(([catId]) => catId !== id)
                )
              ])
            )
          }));

          emit({
            type: 'income/category/deleted',
            payload: { categoryId: id }
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Error desconocido';
          setError(`Error al eliminar categoría: ${message}`);
          throw error;
        }
      },

      // Acciones de matriz
      loadMatrix: async (year: number) => {
        const { adapter, setLoading, setError } = get();
        
        try {
          setLoading(true);
          setError(null);
          
          const matrix = await adapter.getMatrix(year);
          
          set(state => ({
            incomeMatrix: {
              ...state.incomeMatrix,
              [year]: matrix
            }
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Error desconocido';
          setError(`Error al cargar matriz: ${message}`);
          throw error;
        } finally {
          setLoading(false);
        }
      },

      setCell: async (year: number, categoryId: string, month: number, value: number) => {
        const { adapter, setError, emit } = get();
        
        try {
          setError(null);
          
          await adapter.setCell(year, categoryId, month, value);
          
          set(state => ({
            incomeMatrix: {
              ...state.incomeMatrix,
              [year]: {
                ...state.incomeMatrix[year],
                [categoryId]: {
                  ...state.incomeMatrix[year]?.[categoryId],
                  [month]: value
                }
              }
            }
          }));

          emit({
            type: 'income/updated',
            payload: { year, categoryId, month, value }
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Error desconocido';
          setError(`Error al guardar celda: ${message}`);
          throw error;
        }
      },

      bulkSetRow: async (year: number, categoryId: string, valuesByMonth: Record<number, number>) => {
        const { adapter, setError, emit } = get();
        
        try {
          setError(null);
          
          await adapter.bulkSetRow(year, categoryId, valuesByMonth);
          
          set(state => ({
            incomeMatrix: {
              ...state.incomeMatrix,
              [year]: {
                ...state.incomeMatrix[year],
                [categoryId]: {
                  ...state.incomeMatrix[year]?.[categoryId],
                  ...valuesByMonth
                }
              }
            }
          }));

          for (const [monthStr, value] of Object.entries(valuesByMonth)) {
            const month = parseInt(monthStr);
            emit({
              type: 'income/updated',
              payload: { year, categoryId, month, value }
            });
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Error desconocido';
          setError(`Error al guardar fila: ${message}`);
          throw error;
        }
      },

      // Event bus
      subscribe: (eventType: string, callback: (event: IncomeEvent) => void) => {
        const { eventListeners } = get();
        
        if (!eventListeners.has(eventType)) {
          eventListeners.set(eventType, []);
        }
        
        eventListeners.get(eventType)!.push(callback);
        
        return () => {
          const listeners = eventListeners.get(eventType);
          if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
              listeners.splice(index, 1);
            }
          }
        };
      },

      emit: (event: IncomeEvent) => {
        const { eventListeners } = get();
        const listeners = eventListeners.get(event.type);
        
        if (listeners) {
          listeners.forEach(callback => {
            try {
              callback(event);
            } catch (error) {
              console.error('Error en event listener:', error);
            }
          });
        }
      },

      // Inicialización
      initialize: async () => {
        const { adapter, loadCategories, loadMatrix, selectedYear, setError } = get();
        
        try {
          console.log('🔧 Inicializando store principal...');
          setError(null);
          
          console.log('🔧 Inicializando adapter...');
          await adapter.initialize();
          
          console.log('🔧 Cargando categorías...');
          await loadCategories();
          
          console.log('🔧 Cargando matriz para año:', selectedYear);
          await loadMatrix(selectedYear);
          
          console.log('✅ Store inicializado correctamente');
        } catch (error) {
          console.error('❌ Error en inicialización del store:', error);
          const message = error instanceof Error ? error.message : 'Error desconocido';
          setError(`Error al inicializar: ${message}`);
          throw error;
        }
      },
    }),
    {
      name: 'finance-store',
    }
  )
);

// Selectores memoizados
export const getMonthlyTotals = (year: number) => (state: FinanceState): MonthlyTotals => {
  const matrix = state.incomeMatrix[year] || {};
  const totals: MonthlyTotals = {};
  
  for (let month = 1; month <= 12; month++) {
    totals[month] = Object.values(matrix).reduce((sum, categoryData) => {
      return sum + (categoryData[month] || 0);
    }, 0);
  }
  
  return totals;
};

export const getAnnualTotalsByCategory = (year: number) => (state: FinanceState): CategoryTotals => {
  const matrix = state.incomeMatrix[year] || {};
  const totals: CategoryTotals = {};
  
  Object.entries(matrix).forEach(([categoryId, categoryData]) => {
    totals[categoryId] = Object.values(categoryData).reduce((sum, value) => sum + value, 0);
  });
  
  return totals;
};

export const getGrandTotal = (year: number) => (state: FinanceState): number => {
  const matrix = state.incomeMatrix[year] || {};
  
  return Object.values(matrix).reduce((total, categoryData) => {
    return total + Object.values(categoryData).reduce((sum, value) => sum + value, 0);
  }, 0);
};