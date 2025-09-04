/**
 * API Routes para gestión de categorías de ingresos
 * GET /api/income/categories - Listar categorías
 * POST /api/income/categories - Crear categoría
 */

import { NextRequest, NextResponse } from 'next/server';
import { CreateCategorySchema, ApiSuccessSchema, ApiErrorSchema } from '@/lib/finance/schema';
import { ZodError } from 'zod';

// Simulación de base de datos - en producción usar una DB real
let mockCategories = [
  {
    id: '1',
    name: 'Sueldo',
    order: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2', 
    name: 'Turnos',
    order: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

/**
 * GET /api/income/categories
 */
export async function GET() {
  try {
    const sortedCategories = mockCategories.sort((a, b) => a.order - b.order);
    
    return NextResponse.json({
      success: true,
      data: sortedCategories,
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    
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
 * POST /api/income/categories
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar entrada
    const validatedData = CreateCategorySchema.parse(body);
    
    // Verificar que no exista una categoría con el mismo nombre
    const existingCategory = mockCategories.find(
      cat => cat.name.toLowerCase() === validatedData.name.toLowerCase()
    );
    
    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ya existe una categoría con ese nombre',
        },
        { status: 400 }
      );
    }
    
    // Crear nueva categoría
    const maxOrder = mockCategories.length > 0 
      ? Math.max(...mockCategories.map(c => c.order)) 
      : -1;
    
    const newCategory = {
      id: crypto.randomUUID(),
      name: validatedData.name.trim(),
      order: maxOrder + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    mockCategories.push(newCategory);
    
    return NextResponse.json(
      {
        success: true,
        data: newCategory,
      },
      { status: 201 }
    );
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
    
    console.error('Error al crear categoría:', error);
    
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
