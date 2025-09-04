/**
 * Adapter para API REST - Esqueleto para implementación futura
 */

import { Category, IncomeMatrix } from '@/lib/finance/types';
import { IncomeDataAdapter, AdapterError } from './types';
import { ApiResponse } from '@/lib/finance/schema';

export class RestAdapter implements IncomeDataAdapter {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(baseUrl: string = '/api/income', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
    };
  }

  async initialize(): Promise<void> {
    // Verificar conectividad con la API
    try {
      await this.request('GET', '/health');
    } catch (error) {
      throw new AdapterError('No se pudo conectar con la API', 'CONNECTION_ERROR', error);
    }
  }

  /**
   * GET /api/income/categories
   */
  async listCategories(): Promise<Category[]> {
    try {
      const response = await this.request<Category[]>('GET', '/categories');
      return response.map(cat => ({
        ...cat,
        createdAt: new Date(cat.createdAt),
        updatedAt: new Date(cat.updatedAt),
      }));
    } catch (error) {
      throw new AdapterError('Error al obtener categorías', 'FETCH_CATEGORIES_ERROR', error);
    }
  }

  /**
   * POST /api/income/categories
   * Body: { name: string }
   */
  async createCategory(name: string): Promise<Category> {
    try {
      const response = await this.request<Category>('POST', '/categories', { name });
      return {
        ...response,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      };
    } catch (error) {
      throw new AdapterError('Error al crear categoría', 'CREATE_CATEGORY_ERROR', error);
    }
  }

  /**
   * PATCH /api/income/categories/:id
   * Body: { name: string }
   */
  async renameCategory(id: string, name: string): Promise<void> {
    try {
      await this.request('PATCH', `/categories/${id}`, { name });
    } catch (error) {
      throw new AdapterError('Error al renombrar categoría', 'RENAME_CATEGORY_ERROR', error);
    }
  }

  /**
   * DELETE /api/income/categories/:id
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      await this.request('DELETE', `/categories/${id}`);
    } catch (error) {
      throw new AdapterError('Error al eliminar categoría', 'DELETE_CATEGORY_ERROR', error);
    }
  }

  /**
   * PATCH /api/income/categories/reorder
   * Body: { order: string[] }
   */
  async reorderCategories(order: string[]): Promise<void> {
    try {
      await this.request('PATCH', '/categories/reorder', { order });
    } catch (error) {
      throw new AdapterError('Error al reordenar categorías', 'REORDER_CATEGORIES_ERROR', error);
    }
  }

  /**
   * GET /api/income/matrix?year=YYYY
   */
  async getMatrix(year: number): Promise<IncomeMatrix> {
    try {
      const response = await this.request<IncomeMatrix>('GET', `/matrix?year=${year}`);
      return response;
    } catch (error) {
      throw new AdapterError('Error al obtener matriz', 'FETCH_MATRIX_ERROR', error);
    }
  }

  /**
   * PATCH /api/income/matrix
   * Body: { year: number, categoryId: string, month: number, value: number }
   */
  async setCell(year: number, categoryId: string, month: number, value: number): Promise<void> {
    try {
      await this.request('PATCH', '/matrix', { year, categoryId, month, value });
    } catch (error) {
      throw new AdapterError('Error al actualizar celda', 'UPDATE_CELL_ERROR', error);
    }
  }

  /**
   * POST /api/income/matrix/bulk-row
   * Body: { year: number, categoryId: string, valuesByMonth: Record<number, number> }
   */
  async bulkSetRow(year: number, categoryId: string, valuesByMonth: Record<number, number>): Promise<void> {
    try {
      await this.request('POST', '/matrix/bulk-row', { year, categoryId, valuesByMonth });
    } catch (error) {
      throw new AdapterError('Error al actualizar fila', 'BULK_UPDATE_ERROR', error);
    }
  }

  async reset(): Promise<void> {
    try {
      await this.request('DELETE', '/reset');
    } catch (error) {
      throw new AdapterError('Error al resetear datos', 'RESET_ERROR', error);
    }
  }

  /**
   * Método auxiliar para realizar requests HTTP
   */
  private async request<T = any>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const options: RequestInit = {
        method,
        headers: this.headers,
        ...(body && { body: JSON.stringify(body) }),
      };

      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
      }

      const data: ApiResponse<T> = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }

      return data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de red desconocido');
    }
  }
}

// Endpoints sugeridos para implementar en el backend:

/*
GET    /api/income/health                    - Verificar estado de la API
GET    /api/income/categories               - Listar categorías
POST   /api/income/categories               - Crear categoría { name }
PATCH  /api/income/categories/:id           - Actualizar categoría { name?, position? }
DELETE /api/income/categories/:id           - Eliminar categoría
PATCH  /api/income/categories/reorder       - Reordenar { order: string[] }

GET    /api/income/matrix?year=YYYY         - Obtener matriz del año
PATCH  /api/income/matrix                   - Actualizar celda { year, categoryId, month, value }
POST   /api/income/matrix/bulk-row          - Actualizar fila { year, categoryId, valuesByMonth }

DELETE /api/income/reset                    - Resetear todos los datos (solo desarrollo)
*/
