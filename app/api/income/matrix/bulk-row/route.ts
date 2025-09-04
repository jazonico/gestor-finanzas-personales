/**
 * API Route para actualización masiva de filas en la matriz
 * POST /api/income/matrix/bulk-row - Actualizar fila completa
 */

import { NextRequest, NextResponse } from 'next/server';
import { BulkSetRowSchema } from '@/lib/finance/schema';
import { ZodError } from 'zod';

// Usar la misma referencia de datos que matrix/route.ts
const getMockMatrix = () => {
  return global.mockMatrix || {};
};

const setMockMatrix = (matrix: any) => {
  global.mockMatrix = matrix;
};

/**
 * POST /api/income/matrix/bulk-row
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar entrada
    const validatedData = BulkSetRowSchema.parse(body);
    const { year, categoryId, valuesByMonth } = validatedData;
    
    const matrix = getMockMatrix();
    
    // Inicializar año si no existe
    if (!matrix[year]) {
      matrix[year] = {};
    }
    
    // Inicializar categoría si no existe
    if (!matrix[year][categoryId]) {
      matrix[year][categoryId] = {};
    }
    
    // Actualizar todos los valores del mes
    for (const [monthStr, value] of Object.entries(valuesByMonth)) {
      const month = parseInt(monthStr);
      if (month >= 1 && month <= 12) {
        matrix[year][categoryId][month] = Math.max(0, Math.round(value));
      }
    }
    
    setMockMatrix(matrix);
    
    return NextResponse.json({
      success: true,
      data: {
        year,
        categoryId,
        updatedValues: matrix[year][categoryId],
        message: `Actualizados ${Object.keys(valuesByMonth).length} valores para la categoría`,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos de entrada inválidos',
          details: error.errors.map(e => e.message).join(', '),
        },
        { status: 400 }
      );
    }
    
    console.error('Error al actualizar fila:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
