/**
 * Tests para el componente IncomeMatrix
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import IncomeMatrix from '../IncomeMatrix';
import { useIncomeMatrix } from '@/hooks/useIncomeMatrix';
import { useIncomeTotals } from '@/hooks/useIncomeTotals';

// Mock de los hooks
vi.mock('@/hooks/useIncomeMatrix');
vi.mock('@/hooks/useIncomeTotals');

const mockUseIncomeMatrix = vi.mocked(useIncomeMatrix);
const mockUseIncomeTotals = vi.mocked(useIncomeTotals);

const mockCategories = [
  {
    id: '1',
    name: 'Sueldo',
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Turnos',
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockMatrix = {
  '1': { 1: 500000, 2: 520000 },
  '2': { 1: 150000, 2: 180000 },
};

const mockTotals = {
  monthlyTotals: { 1: 650000, 2: 700000 },
  categoryTotals: { '1': 1020000, '2': 330000 },
  grandTotal: 1350000,
};

describe('IncomeMatrix', () => {
  beforeEach(() => {
    mockUseIncomeMatrix.mockReturnValue({
      categories: mockCategories,
      matrix: mockMatrix,
      isLoading: false,
      error: null,
      createCategory: vi.fn(),
      renameCategory: vi.fn(),
      deleteCategory: vi.fn(),
      reorderCategories: vi.fn(),
      setCell: vi.fn(),
      setCellFromString: vi.fn(),
      bulkSetRow: vi.fn(),
      pasteExcelRow: vi.fn(),
      pasteExcelMatrix: vi.fn(),
      getCellValue: vi.fn((categoryId, month) => mockMatrix[categoryId]?.[month] || 0),
      clearError: vi.fn(),
    });

    mockUseIncomeTotals.mockReturnValue({
      ...mockTotals,
      averageMonthly: 675000,
      highestMonth: { month: 2, monthName: 'Feb', value: 700000 },
      lowestMonth: { month: 1, monthName: 'Ene', value: 650000 },
      topCategories: [
        { categoryId: '1', categoryName: 'Sueldo', total: 1020000, percentage: 75.56 },
        { categoryId: '2', categoryName: 'Turnos', total: 330000, percentage: 24.44 },
      ],
      getMonthTotal: vi.fn(),
      getCategoryTotal: vi.fn(),
      getCategoryPercentage: vi.fn(),
    });
  });

  it('renderiza la matriz correctamente', () => {
    render(<IncomeMatrix year={2024} />);

    // Verificar encabezados
    expect(screen.getByText('Tipo de Ingreso')).toBeInTheDocument();
    expect(screen.getByText('Ene')).toBeInTheDocument();
    expect(screen.getByText('Feb')).toBeInTheDocument();
    expect(screen.getByText('Total Anual')).toBeInTheDocument();

    // Verificar categorías
    expect(screen.getByText('Sueldo')).toBeInTheDocument();
    expect(screen.getByText('Turnos')).toBeInTheDocument();

    // Verificar totales
    expect(screen.getByText('Totales Mensuales')).toBeInTheDocument();
  });

  it('muestra valores formateados correctamente', () => {
    render(<IncomeMatrix year={2024} showCLPFormat={true} />);

    // Los valores deberían mostrarse formateados
    // Nota: Los valores exactos dependen de la implementación de formatCLP
    expect(screen.getByText(/500\.000|500,000/)).toBeInTheDocument();
  });

  it('permite editar celdas', async () => {
    const mockSetCellFromString = vi.fn();
    mockUseIncomeMatrix.mockReturnValue({
      ...mockUseIncomeMatrix(),
      setCellFromString: mockSetCellFromString,
    });

    render(<IncomeMatrix year={2024} />);

    // Hacer click en una celda para editarla
    const cell = screen.getByText(/500\.000|500,000/).closest('td');
    if (cell) {
      fireEvent.click(cell);
    }

    // Debería aparecer un input
    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    // Escribir un nuevo valor
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '550000' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Verificar que se llamó la función de actualización
    await waitFor(() => {
      expect(mockSetCellFromString).toHaveBeenCalled();
    });
  });

  it('maneja el pegado de datos de Excel', async () => {
    const mockPasteExcelRow = vi.fn();
    mockUseIncomeMatrix.mockReturnValue({
      ...mockUseIncomeMatrix(),
      pasteExcelRow: mockPasteExcelRow,
    });

    render(<IncomeMatrix year={2024} />);

    // Simular pegado en una celda
    const cell = screen.getByText('Sueldo').closest('td');
    if (cell) {
      const pasteEvent = new Event('paste', { bubbles: true });
      Object.defineProperty(pasteEvent, 'clipboardData', {
        value: {
          getData: () => '500000\t520000\t510000',
        },
      });

      fireEvent(cell, pasteEvent);
    }

    await waitFor(() => {
      expect(mockPasteExcelRow).toHaveBeenCalled();
    });
  });

  it('calcula totales correctamente', () => {
    render(<IncomeMatrix year={2024} />);

    // Verificar que los totales se muestran
    // Los valores exactos dependen del formato
    expect(screen.getByText(/1\.350\.000|1,350,000/)).toBeInTheDocument();
  });

  it('permite crear nuevas categorías', async () => {
    const mockCreateCategory = vi.fn();
    mockUseIncomeMatrix.mockReturnValue({
      ...mockUseIncomeMatrix(),
      createCategory: mockCreateCategory,
    });

    render(<IncomeMatrix year={2024} />);

    // Hacer click en el botón de agregar
    const addButton = screen.getByText('+ Agregar tipo de ingreso');
    fireEvent.click(addButton);

    // Debería aparecer un input para el nombre
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/nueva categoría/i)).toBeInTheDocument();
    });

    // Escribir nombre y confirmar
    const input = screen.getByPlaceholderText(/nueva categoría/i);
    fireEvent.change(input, { target: { value: 'Nueva Categoría' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockCreateCategory).toHaveBeenCalledWith('Nueva Categoría');
    });
  });

  it('muestra estado de carga', () => {
    mockUseIncomeMatrix.mockReturnValue({
      ...mockUseIncomeMatrix(),
      isLoading: true,
    });

    render(<IncomeMatrix year={2024} />);

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('muestra errores', () => {
    const errorMessage = 'Error de prueba';
    mockUseIncomeMatrix.mockReturnValue({
      ...mockUseIncomeMatrix(),
      error: errorMessage,
    });

    render(<IncomeMatrix year={2024} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
