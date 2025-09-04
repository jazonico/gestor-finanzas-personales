/**
 * Componente principal de la matriz de ingresos tipo Excel
 */

import { useState, useRef, useCallback, useEffect, KeyboardEvent } from 'react';
import { Edit2, Trash2, GripVertical, Check, X, Plus } from 'lucide-react';
import { useIncomeMatrix } from '../hooks/useIncomeMatrix';
import { useIncomeTotals } from '../hooks/useIncomeTotals';
import { formatCLP, formatForInput } from '../utils/currency';
import { MONTHS } from '../lib/finance/types';

interface IncomeMatrixProps {
  year: number;
  showCLPFormat?: boolean;
}

interface EditingCell {
  categoryId: string;
  month: number;
}

interface EditingCategory {
  categoryId: string;
  originalName: string;
}

export default function IncomeMatrix({ year, showCLPFormat = true }: IncomeMatrixProps) {
  // Hooks
  const {
    categories,
    isLoading,
    error,
    createCategory,
    renameCategory,
    deleteCategory,
    setCellFromString,
    pasteExcelRow,
    getCellValue,
    clearError,
  } = useIncomeMatrix(year);

  const { monthlyTotals, categoryTotals, grandTotal } = useIncomeTotals(year);

  // Estado local
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editingCategory, setEditingCategory] = useState<EditingCategory | null>(null);
  const [cellValue, setCellValue] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Referencias
  const cellInputRef = useRef<HTMLInputElement>(null);
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const newCategoryInputRef = useRef<HTMLInputElement>(null);

  // Enfocar inputs cuando se activa la edición
  useEffect(() => {
    if (editingCell && cellInputRef.current) {
      cellInputRef.current.focus();
      cellInputRef.current.select();
    }
  }, [editingCell]);

  useEffect(() => {
    if (editingCategory && categoryInputRef.current) {
      categoryInputRef.current.focus();
      categoryInputRef.current.select();
    }
  }, [editingCategory]);

  useEffect(() => {
    if (isCreatingCategory && newCategoryInputRef.current) {
      newCategoryInputRef.current.focus();
    }
  }, [isCreatingCategory]);

  // Manejo de edición de celdas
  const startCellEdit = useCallback((categoryId: string, month: number) => {
    const currentValue = getCellValue(categoryId, month);
    setEditingCell({ categoryId, month });
    setCellValue(formatForInput(currentValue));
  }, [getCellValue]);

  const cancelCellEdit = useCallback(() => {
    setEditingCell(null);
    setCellValue('');
  }, []);

  const saveCellEdit = useCallback(async () => {
    if (!editingCell) return;

    try {
      await setCellFromString(editingCell.categoryId, editingCell.month, cellValue);
      setEditingCell(null);
      setCellValue('');
    } catch (error) {
      console.error('Error al guardar celda:', error);
    }
  }, [editingCell, cellValue, setCellFromString]);

  // Manejo de edición de categorías
  const startCategoryEdit = useCallback((categoryId: string, currentName: string) => {
    setEditingCategory({ categoryId, originalName: currentName });
    setCategoryName(currentName);
  }, []);

  const cancelCategoryEdit = useCallback(() => {
    setEditingCategory(null);
    setCategoryName('');
  }, []);

  const saveCategoryEdit = useCallback(async () => {
    if (!editingCategory || !categoryName.trim()) return;

    try {
      await renameCategory(editingCategory.categoryId, categoryName.trim());
      setEditingCategory(null);
      setCategoryName('');
    } catch (error) {
      console.error('Error al renombrar categoría:', error);
    }
  }, [editingCategory, categoryName, renameCategory]);

  // Manejo de creación de categorías
  const startCategoryCreation = useCallback(() => {
    setIsCreatingCategory(true);
    setNewCategoryName('');
  }, []);

  const cancelCategoryCreation = useCallback(() => {
    setIsCreatingCategory(false);
    setNewCategoryName('');
  }, []);

  const saveCategoryCreation = useCallback(async () => {
    if (!newCategoryName.trim()) return;

    try {
      await createCategory(newCategoryName.trim());
      setIsCreatingCategory(false);
      setNewCategoryName('');
    } catch (error) {
      console.error('Error al crear categoría:', error);
    }
  }, [newCategoryName, createCategory]);

  // Manejo de eliminación
  const handleDeleteCategory = useCallback(async (categoryId: string, categoryName: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${categoryName}"? Esto eliminará todos los datos asociados.`)) {
      return;
    }

    try {
      await deleteCategory(categoryId);
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
    }
  }, [deleteCategory]);

  // Manejo de teclado
  const handleCellKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        saveCellEdit();
        break;
      case 'Escape':
        e.preventDefault();
        cancelCellEdit();
        break;
      case 'Tab':
        e.preventDefault();
        saveCellEdit();
        break;
    }
  }, [saveCellEdit, cancelCellEdit]);

  const handleCategoryKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        saveCategoryEdit();
        break;
      case 'Escape':
        e.preventDefault();
        cancelCategoryEdit();
        break;
    }
  }, [saveCategoryEdit, cancelCategoryEdit]);

  const handleNewCategoryKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        saveCategoryCreation();
        break;
      case 'Escape':
        e.preventDefault();
        cancelCategoryCreation();
        break;
    }
  }, [saveCategoryCreation, cancelCategoryCreation]);

  // Manejo de pegado
  const handlePaste = useCallback(async (e: React.ClipboardEvent, categoryId: string, month: number) => {
    e.preventDefault();
    
    try {
      const clipboardData = e.clipboardData.getData('text');
      const lines = clipboardData.split('\n').filter(line => line.trim());
      
      if (lines.length === 1) {
        // Pegar una sola fila
        const values = lines[0].split('\t');
        if (values.length > 1) {
          // Múltiples valores - distribuir por meses desde el mes actual
          const monthlyValues: string[] = [];
          for (let i = 0; i < 12; i++) {
            const targetMonth = month + i;
            if (targetMonth <= 12 && i < values.length) {
              monthlyValues.push(values[i]);
            }
          }
          await pasteExcelRow(categoryId, monthlyValues);
        } else {
          // Un solo valor - pegar en la celda actual
          await setCellFromString(categoryId, month, values[0]);
        }
      } else {
        // Múltiples filas - pegar primera fila
        const firstRowValues = lines[0].split('\t');
        await pasteExcelRow(categoryId, firstRowValues);
      }
    } catch (error) {
      console.error('Error al pegar:', error);
    }
  }, [setCellFromString, pasteExcelRow]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando matriz de ingresos...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center justify-between">
            <div className="text-red-700 text-sm">{error}</div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tabla principal */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Encabezado */}
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="sticky left-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 z-10">
                Tipo de Ingreso
              </th>
              {Object.entries(MONTHS).map(([monthNum, monthName]) => (
                <th
                  key={monthNum}
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[120px]"
                >
                  {monthName}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50 min-w-[140px]">
                Total Anual
              </th>
            </tr>
          </thead>

          {/* Cuerpo */}
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category, index) => (
              <tr key={category.id} className={`group ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                {/* Columna de categoría (sticky) */}
                <td className="sticky left-0 bg-inherit px-4 py-3 border-r border-gray-200 z-10">
                  <div className="flex items-center space-x-2">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                    
                    {editingCategory?.categoryId === category.id ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          ref={categoryInputRef}
                          type="text"
                          value={categoryName}
                          onChange={(e) => setCategoryName(e.target.value)}
                          onKeyDown={handleCategoryKeyDown}
                          className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          onClick={saveCategoryEdit}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelCategoryEdit}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-medium text-gray-900 flex-1">
                          {category.name}
                        </span>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startCategoryEdit(category.id, category.name)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Renombrar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id, category.name)}
                            className="text-gray-400 hover:text-red-600"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>

                {/* Celdas de meses */}
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
                  const cellKey = `${category.id}-${month}`;
                  const value = getCellValue(category.id, month);
                  const isEditing = editingCell?.categoryId === category.id && editingCell?.month === month;

                  return (
                    <td
                      key={cellKey}
                      className="px-2 py-2 text-center border-r border-gray-200 hover:bg-blue-50 cursor-pointer group"
                      onClick={() => !isEditing && startCellEdit(category.id, month)}
                      onPaste={(e) => handlePaste(e, category.id, month)}
                    >
                      {isEditing ? (
                        <input
                          ref={cellInputRef}
                          type="text"
                          value={cellValue}
                          onChange={(e) => setCellValue(e.target.value)}
                          onKeyDown={handleCellKeyDown}
                          onBlur={saveCellEdit}
                          className="w-full px-2 py-1 text-sm text-center border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">
                          {value > 0 ? (showCLPFormat ? formatCLP(value) : value.toLocaleString()) : ''}
                        </div>
                      )}
                    </td>
                  );
                })}

                {/* Total anual por categoría */}
                <td className="px-4 py-3 text-center font-medium text-gray-900 bg-blue-50 border-l-2 border-blue-200">
                  {showCLPFormat ? formatCLP(categoryTotals[category.id] || 0) : (categoryTotals[category.id] || 0).toLocaleString()}
                </td>
              </tr>
            ))}

            {/* Fila para agregar nueva categoría */}
            {isCreatingCategory && (
              <tr className="bg-yellow-50">
                <td className="sticky left-0 bg-yellow-50 px-4 py-3 border-r border-gray-200 z-10">
                  <div className="flex items-center space-x-2">
                    <input
                      ref={newCategoryInputRef}
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={handleNewCategoryKeyDown}
                      placeholder="Nombre de la nueva categoría"
                      className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={saveCategoryCreation}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelCategoryCreation}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td colSpan={13} className="px-4 py-3 text-center text-sm text-gray-500">
                  Escribe el nombre y presiona Enter
                </td>
              </tr>
            )}

            {/* Fila de totales mensuales */}
            <tr className="bg-blue-50 border-t-2 border-blue-200 font-medium">
              <td className="sticky left-0 bg-blue-50 px-6 py-3 text-sm font-semibold text-gray-900 border-r border-blue-200 z-10">
                Totales Mensuales
              </td>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <td key={month} className="px-4 py-3 text-center text-sm text-gray-900 border-r border-blue-200">
                  {showCLPFormat ? formatCLP(monthlyTotals[month] || 0) : (monthlyTotals[month] || 0).toLocaleString()}
                </td>
              ))}
              <td className="px-4 py-3 text-center text-lg font-bold text-blue-900 bg-blue-100 border-l-2 border-blue-300">
                {showCLPFormat ? formatCLP(grandTotal) : grandTotal.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Botón para agregar categoría */}
      {!isCreatingCategory && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={startCategoryCreation}
            className="flex items-center space-x-2 w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar tipo de ingreso</span>
          </button>
        </div>
      )}
    </div>
  );
}
