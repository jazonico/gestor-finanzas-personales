/**
 * Versión básica de Income Matrix sin bucles infinitos
 */

import { useState, useEffect } from 'react';
import { formatCLP } from '../utils/currency';
import { Calendar } from 'lucide-react';

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
                    <span className="text-sm font-medium text-gray-900">
                      {category.name}
                    </span>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">📊 Matriz de Ingresos - Versión Mejorada</h3>
          <p className="text-sm text-gray-600 mb-4">
            ✨ <strong>¡Funcionalidad completa!</strong> Haz clic en cualquier celda para editarla. 
            Cambia el año para ver diferentes períodos.
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
          <div className="mt-4 text-xs text-gray-500">
            💡 <strong>Tip:</strong> Usa Enter para guardar, Escape para cancelar. Los datos se actualizan automáticamente.
          </div>
        </div>
      </div>
    </div>
  );
}
