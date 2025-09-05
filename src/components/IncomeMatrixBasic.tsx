/**
 * Versión básica de Income Matrix sin bucles infinitos
 */

import { useState, useEffect } from 'react';
import { formatCLP } from '../utils/currency';
import { Calendar, Plus, Edit2, Trash2, Check, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  order: number;
}

interface IncomeData {
  [categoryId: string]: {
    [month: number]: number;
  };
}

export default function IncomeMatrixBasic() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [incomeData, setIncomeData] = useState<IncomeData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCLP, setShowCLP] = useState(true);
  const [editingCell, setEditingCell] = useState<{categoryId: string, month: number} | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState<string>('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Inicialización simple sin store externo
  useEffect(() => {
    const initializeData = () => {
      try {
        console.log('🚀 Inicializando Income Matrix Basic...');
        
        // Crear categorías de ejemplo
        const exampleCategories: Category[] = [
          { id: '1', name: 'Sueldo', order: 0 },
          { id: '2', name: 'Turnos', order: 1 },
          { id: '3', name: 'UMed', order: 2 },
          { id: '4', name: 'Arriendos', order: 3 },
          { id: '5', name: 'Dividendos', order: 4 },
        ];

        // Crear datos de ejemplo
        const exampleData: IncomeData = {};
        const currentMonth = new Date().getMonth() + 1;

        exampleCategories.forEach(category => {
          exampleData[category.id] = {};
          
          // Agregar datos para los últimos 3 meses
          for (let i = 0; i < 3; i++) {
            const month = Math.max(1, currentMonth - i);
            const randomAmount = Math.floor(Math.random() * 500000) + 100000;
            exampleData[category.id][month] = randomAmount;
          }
        });

        setCategories(exampleCategories);
        setIncomeData(exampleData);
        setIsLoading(false);
        
        console.log('✅ Income Matrix Basic inicializado');
      } catch (err) {
        console.error('❌ Error en inicialización:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setIsLoading(false);
      }
    };

    initializeData();
  }, []); // Sin dependencias para evitar bucles

  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  const getCellValue = (categoryId: string, month: number): number => {
    return incomeData[categoryId]?.[month] || 0;
  };

  const getCategoryTotal = (categoryId: string): number => {
    const categoryData = incomeData[categoryId] || {};
    return Object.values(categoryData).reduce((sum, value) => sum + value, 0);
  };

  const getMonthTotal = (month: number): number => {
    return categories.reduce((sum, category) => {
      return sum + getCellValue(category.id, month);
    }, 0);
  };

  const getGrandTotal = (): number => {
    return categories.reduce((sum, category) => {
      return sum + getCategoryTotal(category.id);
    }, 0);
  };

  const handleCellClick = (categoryId: string, month: number) => {
    setEditingCell({ categoryId, month });
    setEditValue(getCellValue(categoryId, month).toString());
  };

  const handleCellSave = () => {
    if (editingCell) {
      const value = parseFloat(editValue) || 0;
      setIncomeData(prev => ({
        ...prev,
        [editingCell.categoryId]: {
          ...prev[editingCell.categoryId],
          [editingCell.month]: value
        }
      }));
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellSave();
    } else if (e.key === 'Escape') {
      handleCellCancel();
    }
  };

  // Funciones para gestión de categorías
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: generateId(),
        name: newCategoryName.trim(),
        order: categories.length
      };
      setCategories(prev => [...prev, newCategory]);
      setIncomeData(prev => ({
        ...prev,
        [newCategory.id]: {}
      }));
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  const startEditCategory = (categoryId: string, currentName: string) => {
    setEditingCategory(categoryId);
    setEditCategoryName(currentName);
  };

  const saveEditCategory = () => {
    if (editingCategory && editCategoryName.trim()) {
      setCategories(prev =>
        prev.map(cat =>
          cat.id === editingCategory
            ? { ...cat, name: editCategoryName.trim() }
            : cat
        )
      );
      setEditingCategory(null);
      setEditCategoryName('');
    }
  };

  const cancelEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryName('');
  };

  const deleteCategory = (categoryId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría? Se perderán todos los datos asociados.')) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      setIncomeData(prev => {
        const newData = { ...prev };
        delete newData[categoryId];
        return newData;
      });
    }
  };

  const handleCategoryKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (showAddCategory) {
        addCategory();
      } else if (editingCategory) {
        saveEditCategory();
      }
    } else if (e.key === 'Escape') {
      if (showAddCategory) {
        setShowAddCategory(false);
        setNewCategoryName('');
      } else if (editingCategory) {
        cancelEditCategory();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Cargando matriz de ingresos...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <h2 className="font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Version banner */}
      <div className="w-full bg-amber-100 text-amber-900 text-center text-xs py-1">
        Income Matrix Basic v1 • sin store externo
      </div>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Matriz de Ingresos
            </h1>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                {Array.from({ length: 11 }, (_, i) => {
                  const y = new Date().getFullYear() - 5 + i;
                  return (
                    <option key={y} value={y}>{y}</option>
                  );
                })}
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddCategory(true)}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Categoría</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                {showCLP ? 'Formato CLP' : 'Números'}
              </span>
              <button
                onClick={() => setShowCLP(!showCLP)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {showCLP ? '123' : '$'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky left-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Tipo de Ingreso
                </th>
                {months.map((month, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[120px]"
                  >
                    {month}
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
                  Total Anual
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category, index) => (
                <tr key={category.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="sticky left-0 bg-inherit px-6 py-3 border-r border-gray-200">
                    <div className="flex items-center justify-between group">
                      {editingCategory === category.id ? (
                        <div className="flex items-center space-x-2 flex-1">
                          <input
                            type="text"
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                            onKeyPress={handleCategoryKeyPress}
                            onBlur={saveEditCategory}
                            className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:border-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={saveEditCategory}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEditCategory}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm font-medium text-gray-900 flex-1">
                            {category.name}
                          </span>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEditCategory(category.id, category.name)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              title="Editar categoría"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteCategory(category.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="Eliminar categoría"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                  {Array.from({ length: 12 }, (_, monthIndex) => {
                    const month = monthIndex + 1;
                    const value = getCellValue(category.id, month);
                    const isEditing = editingCell?.categoryId === category.id && editingCell?.month === month;
                    
                    return (
                      <td
                        key={month}
                        className="px-4 py-3 text-center border-r border-gray-200"
                      >
                        {isEditing ? (
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            onBlur={handleCellSave}
                            className="w-full px-2 py-1 text-sm text-center border border-blue-300 rounded focus:outline-none focus:border-blue-500"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => handleCellClick(category.id, month)}
                            className="w-full text-sm text-gray-900 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                          >
                            {value > 0 ? (showCLP ? formatCLP(value) : value.toLocaleString()) : '—'}
                          </button>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center font-medium text-gray-900 bg-blue-50">
                    {showCLP ? formatCLP(getCategoryTotal(category.id)) : getCategoryTotal(category.id).toLocaleString()}
                  </td>
                </tr>
              ))}
              
              {/* Fila para agregar nueva categoría */}
              {showAddCategory && (
                <tr className="bg-green-50 border-2 border-green-200">
                  <td className="sticky left-0 bg-green-50 px-6 py-3 border-r border-green-200">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyPress={handleCategoryKeyPress}
                        placeholder="Nombre de la nueva categoría..."
                        className="flex-1 px-2 py-1 text-sm border border-green-300 rounded focus:outline-none focus:border-green-500"
                        autoFocus
                      />
                      <button
                        onClick={addCategory}
                        className="p-1 text-green-600 hover:bg-green-200 rounded"
                        title="Guardar categoría"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setShowAddCategory(false);
                          setNewCategoryName('');
                        }}
                        className="p-1 text-red-600 hover:bg-red-200 rounded"
                        title="Cancelar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  {Array.from({ length: 12 }, (_, monthIndex) => (
                    <td key={monthIndex} className="px-4 py-3 border-r border-green-200 bg-green-50">
                      <span className="text-xs text-green-600">—</span>
                    </td>
                  ))}
                  <td className="px-4 py-3 bg-green-50 text-center">
                    <span className="text-xs text-green-600">Nueva</span>
                  </td>
                </tr>
              )}
              
              {/* Fila de totales */}
              <tr className="bg-blue-50 border-t-2 border-blue-200 font-medium">
                <td className="sticky left-0 bg-blue-50 px-6 py-3 text-sm font-semibold text-gray-900 border-r border-blue-200">
                  Totales Mensuales
                </td>
                {Array.from({ length: 12 }, (_, monthIndex) => {
                  const month = monthIndex + 1;
                  const total = getMonthTotal(month);
                  return (
                    <td key={month} className="px-4 py-3 text-center text-sm text-gray-900 border-r border-blue-200">
                      {showCLP ? formatCLP(total) : total.toLocaleString()}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-center text-lg font-bold text-blue-900 bg-blue-100">
                  {showCLP ? formatCLP(getGrandTotal()) : getGrandTotal().toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Información */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">📊 Matriz de Ingresos - Versión Completa</h3>
          <p className="text-sm text-gray-600 mb-4">
            ✨ <strong>¡Funcionalidad completa!</strong> Haz clic en cualquier celda para editarla. 
            Gestiona categorías con hover sobre los nombres. Cambia el año para ver diferentes períodos.
          </p>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="font-medium text-gray-900">📋 Categorías</div>
              <div className="text-lg font-bold text-blue-600">{categories.length}</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="font-medium text-gray-900">💰 Total Anual</div>
              <div className="text-lg font-bold text-green-600">{showCLP ? formatCLP(getGrandTotal()) : getGrandTotal().toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="font-medium text-gray-900">📅 Promedio Mensual</div>
              <div className="text-lg font-bold text-purple-600">{showCLP ? formatCLP(getGrandTotal() / 12) : Math.round(getGrandTotal() / 12).toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="font-medium text-gray-900">🔧 Estado</div>
              <div className="text-lg font-bold text-green-600">✅ Activo</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <div>💡 <strong>Celdas:</strong> Clic para editar → Enter/Escape para guardar/cancelar</div>
            <div>🏷️ <strong>Categorías:</strong> Hover sobre nombres → Editar/Eliminar • Botón verde para agregar</div>
          </div>
        </div>
      </div>
    </div>
  );
}
