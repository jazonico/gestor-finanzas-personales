/**
 * API Routes para gestión individual de categorías
 * PATCH /api/income/categories/[id] - Actualizar categoría
 * DELETE /api/income/categories/[id] - Eliminar categoría
 */

import { NextRequest, NextResponse } from 'next/server';
import { UpdateCategorySchema } from '@/lib/finance/schema';
import { ZodError } from 'zod';

// Simulación de base de datos - usar la misma referencia que en route.ts
// En producción, esto vendría de una base de datos real
const getMockCategories = () => {
  // Esta función debería acceder a la misma fuente de datos
  // Por simplicidad, mantenemos una referencia global
  return global.mockCategories || [];
};

const setMockCategories = (categories: any[]) => {
  global.mockCategories = categories;
};

// Inicializar si no existe
if (!global.mockCategories) {
  global.mockCategories = [
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
}

/**
 * PATCH /api/income/categories/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Validar entrada
    const validatedData = UpdateCategorySchema.parse(body);
    
    const categories = getMockCategories();
    const categoryIndex = categories.findIndex(cat => cat.id === id);
    
    if (categoryIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Categoría no encontrada',
        },
        { status: 404 }
      );
    }
    
    // Verificar nombre duplicado si se está cambiando
    if (validatedData.name) {
      const existingCategory = categories.find(
        cat => cat.id !== id && cat.name.toLowerCase() === validatedData.name.toLowerCase()
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
    }
    
    // Actualizar categoría
    const updatedCategory = {
      ...categories[categoryIndex],
      ...(validatedData.name && { name: validatedData.name.trim() }),
      ...(validatedData.order !== undefined && { order: validatedData.order }),
      updatedAt: new Date(),
    };
    
    categories[categoryIndex] = updatedCategory;
    setMockCategories(categories);
    
    return NextResponse.json({
      success: true,
      data: updatedCategory,
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
    
    console.error('Error al actualizar categoría:', error);
    
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
 * DELETE /api/income/categories/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const categories = getMockCategories();
    const categoryIndex = categories.findIndex(cat => cat.id === id);
    
    if (categoryIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Categoría no encontrada',
        },
        { status: 404 }
      );
    }
    
    // Eliminar categoría
    categories.splice(categoryIndex, 1);
    setMockCategories(categories);
    
    // TODO: También eliminar datos de matriz asociados
    
    return NextResponse.json({
      success: true,
      data: { message: 'Categoría eliminada exitosamente' },
    });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    
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
  var mockCategories: any[] | undefined;
}
