/**
 * API Routes para gestión de la matriz de ingresos
 * GET /api/income/matrix?year=YYYY - Obtener matriz del año
 * PATCH /api/income/matrix - Actualizar celda
 */

import { NextRequest, NextResponse } from 'next/server';
import { SetCellSchema, YearSchema } from '@/lib/finance/schema';
import { ZodError } from 'zod';

// Simulación de base de datos para matrices
// En producción usar una DB real
const getMockMatrix = () => {
  return global.mockMatrix || {};
};

const setMockMatrix = (matrix: any) => {
  global.mockMatrix = matrix;
};

// Inicializar con datos de ejemplo
if (!global.mockMatrix) {
  const currentYear = new Date().getFullYear();
  global.mockMatrix = {
    [currentYear]: {
      '1': { 1: 500000, 2: 520000, 3: 510000 }, // Sueldo
      '2': { 1: 150000, 2: 180000, 3: 160000 }, // Turnos
    }
  };
}

/**
 * GET /api/income/matrix?year=YYYY
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    
    if (!yearParam) {
      return NextResponse.json(
        {
          success: false,
          error: 'El parámetro year es requerido',
        },
        { status: 400 }
      );
    }
    
    const year = parseInt(yearParam);
    
    // Validar año
    YearSchema.parse(year);
    
    const matrix = getMockMatrix();
    const yearMatrix = matrix[year] || {};
    
    return NextResponse.json({
      success: true,
      data: yearMatrix,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Año inválido',
          details: error.errors.map(e => e.message).join(', '),
        },
        { status: 400 }
      );
    }
    
    console.error('Error al obtener matriz:', error);
    
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

/**
 * PATCH /api/income/matrix
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar entrada
    const validatedData = SetCellSchema.parse(body);
    const { year, categoryId, month, value } = validatedData;
    
    const matrix = getMockMatrix();
    
    // Inicializar año si no existe
    if (!matrix[year]) {
      matrix[year] = {};
    }
    
    // Inicializar categoría si no existe
    if (!matrix[year][categoryId]) {
      matrix[year][categoryId] = {};
    }
    
    // Actualizar valor
    matrix[year][categoryId][month] = Math.max(0, Math.round(value));
    
    setMockMatrix(matrix);
    
    return NextResponse.json({
      success: true,
      data: {
        year,
        categoryId,
        month,
        value: matrix[year][categoryId][month],
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
    
    console.error('Error al actualizar matriz:', error);
    
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

// Declaración global para TypeScript
declare global {
  var mockMatrix: any | undefined;
}
