/**
 * Adapter para persistencia local usando LocalStorage + cache en memoria
 */

import { Category, IncomeMatrix } from '@/lib/finance/types';
import { IncomeDataAdapter, AdapterError } from './types';

const STORAGE_KEYS = {
  CATEGORIES: 'finance_income_categories',
  MATRIX: 'finance_income_matrix',
} as const;

export class LocalAdapter implements IncomeDataAdapter {
  private categoriesCache: Category[] | null = null;
  private matrixCache: Record<number, IncomeMatrix> = {};
  private isInitialized = false;

  /**
   * Inicializa el adapter y carga datos iniciales si no existen
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Cargar categorías existentes o crear datos de ejemplo
      const categories = await this.listCategories();
      
      if (categories.length === 0) {
        await this.seedInitialData();
      }
      
      this.isInitialized = true;
    } catch (error) {
      throw new AdapterError('Error al inicializar LocalAdapter', 'INIT_ERROR', error);
    }
  }

  /**
   * Crea datos de ejemplo para demostración
   */
  private async seedInitialData(): Promise<void> {
    const seedCategories = [
      'Sueldo',
      'Turnos',
      'UMed',
      'Arriendos',
      'Dividendos'
    ];

    const currentYear = new Date().getFullYear();
    
    // Crear categorías
    for (let i = 0; i < seedCategories.length; i++) {
      await this.createCategory(seedCategories[i]);
    }

    // Agregar algunos montos de ejemplo para los últimos 3 meses
    const categories = await this.listCategories();
    const currentMonth = new Date().getMonth() + 1;
    
    for (const category of categories) {
      for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
        const month = Math.max(1, currentMonth - monthOffset);
        const randomAmount = Math.floor(Math.random() * 500000) + 100000; // Entre 100K y 600K
        
        await this.setCell(currentYear, category.id, month, randomAmount);
      }
    }
  }

  /**
   * Lista todas las categorías ordenadas
   */
  async listCategories(): Promise<Category[]> {
    if (this.categoriesCache) {
      return [...this.categoriesCache];
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const categories: Category[] = stored ? JSON.parse(stored) : [];
      
      // Convertir fechas de string a Date
      const parsedCategories = categories.map(cat => ({
        ...cat,
        createdAt: new Date(cat.createdAt),
        updatedAt: new Date(cat.updatedAt),
      }));

      // Ordenar por order
      parsedCategories.sort((a, b) => a.order - b.order);
      
      this.categoriesCache = parsedCategories;
      return [...parsedCategories];
    } catch (error) {
      throw new AdapterError('Error al cargar categorías', 'LOAD_CATEGORIES_ERROR', error);
    }
  }

  /**
   * Crea una nueva categoría
   */
  async createCategory(name: string): Promise<Category> {
    try {
      const categories = await this.listCategories();
      const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.order)) : -1;
      
      const newCategory: Category = {
        id: crypto.randomUUID(),
        name: name.trim(),
        order: maxOrder + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedCategories = [...categories, newCategory];
      await this.saveCategories(updatedCategories);
      
      return newCategory;
    } catch (error) {
      throw new AdapterError('Error al crear categoría', 'CREATE_CATEGORY_ERROR', error);
    }
  }

  /**
   * Renombra una categoría existente
   */
  async renameCategory(id: string, name: string): Promise<void> {
    try {
      const categories = await this.listCategories();
      const categoryIndex = categories.findIndex(c => c.id === id);
      
      if (categoryIndex === -1) {
        throw new AdapterError('Categoría no encontrada', 'CATEGORY_NOT_FOUND');
      }

      categories[categoryIndex] = {
        ...categories[categoryIndex],
        name: name.trim(),
        updatedAt: new Date(),
      };

      await this.saveCategories(categories);
    } catch (error) {
      if (error instanceof AdapterError) throw error;
      throw new AdapterError('Error al renombrar categoría', 'RENAME_CATEGORY_ERROR', error);
    }
  }

  /**
   * Elimina una categoría y todos sus datos asociados
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      const categories = await this.listCategories();
      const filteredCategories = categories.filter(c => c.id !== id);
      
      if (filteredCategories.length === categories.length) {
        throw new AdapterError('Categoría no encontrada', 'CATEGORY_NOT_FOUND');
      }

      await this.saveCategories(filteredCategories);
      
      // Eliminar datos de la matriz para esta categoría
      for (const year in this.matrixCache) {
        if (this.matrixCache[year][id]) {
          delete this.matrixCache[year][id];
          await this.saveMatrix(parseInt(year), this.matrixCache[year]);
        }
      }
    } catch (error) {
      if (error instanceof AdapterError) throw error;
      throw new AdapterError('Error al eliminar categoría', 'DELETE_CATEGORY_ERROR', error);
    }
  }

  /**
   * Reordena las categorías
   */
  async reorderCategories(order: string[]): Promise<void> {
    try {
      const categories = await this.listCategories();
      
      // Verificar que todos los IDs existan
      const categoryIds = new Set(categories.map(c => c.id));
      for (const id of order) {
        if (!categoryIds.has(id)) {
          throw new AdapterError(`Categoría ${id} no encontrada`, 'CATEGORY_NOT_FOUND');
        }
      }

      // Reordenar
      const reorderedCategories = order.map((id, index) => {
        const category = categories.find(c => c.id === id)!;
        return {
          ...category,
          order: index,
          updatedAt: new Date(),
        };
      });

      await this.saveCategories(reorderedCategories);
    } catch (error) {
      if (error instanceof AdapterError) throw error;
      throw new AdapterError('Error al reordenar categorías', 'REORDER_CATEGORIES_ERROR', error);
    }
  }

  /**
   * Obtiene la matriz de ingresos para un año
   */
  async getMatrix(year: number): Promise<IncomeMatrix> {
    if (this.matrixCache[year]) {
      return { ...this.matrixCache[year] };
    }

    try {
      const key = `${STORAGE_KEYS.MATRIX}_${year}`;
      const stored = localStorage.getItem(key);
      const matrix: IncomeMatrix = stored ? JSON.parse(stored) : {};
      
      this.matrixCache[year] = matrix;
      return { ...matrix };
    } catch (error) {
      throw new AdapterError('Error al cargar matriz', 'LOAD_MATRIX_ERROR', error);
    }
  }

  /**
   * Establece el valor de una celda
   */
  async setCell(year: number, categoryId: string, month: number, value: number): Promise<void> {
    try {
      const matrix = await this.getMatrix(year);
      
      if (!matrix[categoryId]) {
        matrix[categoryId] = {};
      }
      
      matrix[categoryId][month] = Math.max(0, Math.round(value));
      
      await this.saveMatrix(year, matrix);
    } catch (error) {
      throw new AdapterError('Error al guardar celda', 'SET_CELL_ERROR', error);
    }
  }

  /**
   * Establece múltiples valores para una fila (categoría)
   */
  async bulkSetRow(year: number, categoryId: string, valuesByMonth: Record<number, number>): Promise<void> {
    try {
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
    } catch (error) {
      throw new AdapterError('Error al guardar fila', 'BULK_SET_ROW_ERROR', error);
    }
  }

  /**
   * Resetea todos los datos
   */
  async reset(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
      
      // Remover todas las matrices
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_KEYS.MATRIX)) {
          localStorage.removeItem(key);
        }
      }

      this.categoriesCache = null;
      this.matrixCache = {};
      this.isInitialized = false;
    } catch (error) {
      throw new AdapterError('Error al resetear datos', 'RESET_ERROR', error);
    }
  }

  /**
   * Guarda las categorías en localStorage y actualiza cache
   */
  private async saveCategories(categories: Category[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      this.categoriesCache = [...categories];
    } catch (error) {
      throw new AdapterError('Error al guardar categorías', 'SAVE_CATEGORIES_ERROR', error);
    }
  }

  /**
   * Guarda la matriz en localStorage y actualiza cache
   */
  private async saveMatrix(year: number, matrix: IncomeMatrix): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.MATRIX}_${year}`;
      localStorage.setItem(key, JSON.stringify(matrix));
      this.matrixCache[year] = { ...matrix };
    } catch (error) {
      throw new AdapterError('Error al guardar matriz', 'SAVE_MATRIX_ERROR', error);
    }
  }
}
