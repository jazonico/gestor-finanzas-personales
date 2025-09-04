/**
 * Barra de herramientas para la matriz de ingresos
 */

'use client';

import { useState } from 'react';
import { Plus, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';

interface IncomeToolbarProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  onAddCategory: () => void;
  showCLPFormat: boolean;
  onFormatToggle: (showCLP: boolean) => void;
  isLoading?: boolean;
}

export default function IncomeToolbar({
  selectedYear,
  onYearChange,
  onAddCategory,
  showCLPFormat,
  onFormatToggle,
  isLoading = false,
}: IncomeToolbarProps) {
  const [yearInput, setYearInput] = useState(selectedYear.toString());

  const handleYearSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const year = parseInt(yearInput);
    if (year >= 2000 && year <= 2100) {
      onYearChange(year);
    } else {
      setYearInput(selectedYear.toString());
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      {/* Lado izquierdo - Selector de año */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <label htmlFor="year-select" className="text-sm font-medium text-gray-700">
            Año:
          </label>
        </div>
        
        <form onSubmit={handleYearSubmit} className="flex items-center space-x-2">
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => onYearChange(parseInt(e.target.value))}
            disabled={isLoading}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          
          <div className="text-xs text-gray-500">
            o escribir:
          </div>
          
          <input
            type="number"
            min="2000"
            max="2100"
            value={yearInput}
            onChange={(e) => setYearInput(e.target.value)}
            onBlur={() => setYearInput(selectedYear.toString())}
            disabled={isLoading}
            className="w-20 px-2 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="YYYY"
          />
          
          <button
            type="submit"
            disabled={isLoading}
            className="px-2 py-2 text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
          >
            IR
          </button>
        </form>
      </div>

      {/* Centro - Título */}
      <div className="flex-1 text-center">
        <h1 className="text-xl font-semibold text-gray-900">
          Matriz de Ingresos {selectedYear}
        </h1>
        {isLoading && (
          <div className="text-sm text-gray-500">
            Cargando datos...
          </div>
        )}
      </div>

      {/* Lado derecho - Controles */}
      <div className="flex items-center space-x-4">
        {/* Toggle formato CLP */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">
            {showCLPFormat ? 'Formato CLP' : 'Números'}
          </span>
          <button
            onClick={() => onFormatToggle(!showCLPFormat)}
            disabled={isLoading}
            className="flex items-center p-1 rounded-md hover:bg-gray-100 disabled:cursor-not-allowed"
            title={showCLPFormat ? 'Cambiar a números' : 'Cambiar a formato CLP'}
          >
            {showCLPFormat ? (
              <ToggleRight className="w-6 h-6 text-blue-600" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-gray-400" />
            )}
          </button>
        </div>

        {/* Botón agregar categoría */}
        <button
          onClick={onAddCategory}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Agregar Tipo</span>
        </button>
      </div>
    </div>
  );
}
