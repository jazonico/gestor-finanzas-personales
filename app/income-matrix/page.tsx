/**
 * Página principal de la matriz de ingresos
 */

'use client';

import { useEffect, useState } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import IncomeMatrix from '@/components/finance/IncomeMatrix';
import IncomeToolbar from '@/components/finance/IncomeToolbar';
import { AlertCircle } from 'lucide-react';

export default function IncomeMatrixPage() {
  const { selectedYear, setYear, initialize, error, isLoading } = useFinanceStore();
  const [showCLPFormat, setShowCLPFormat] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializar el store al montar el componente
  useEffect(() => {
    const initializeStore = async () => {
      try {
        await initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Error al inicializar:', error);
      }
    };

    if (!isInitialized) {
      initializeStore();
    }
  }, [initialize, isInitialized]);

  const handleAddCategory = () => {
    // Esta función se maneja desde el componente IncomeMatrix
    // Aquí podrías agregar lógica adicional si es necesario
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Inicializando matriz de ingresos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error global */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Barra de herramientas */}
      <IncomeToolbar
        selectedYear={selectedYear}
        onYearChange={setYear}
        onAddCategory={handleAddCategory}
        showCLPFormat={showCLPFormat}
        onFormatToggle={setShowCLPFormat}
        isLoading={isLoading}
      />

      {/* Matriz principal */}
      <div className="p-6">
        <div className="max-w-full overflow-hidden">
          <IncomeMatrix 
            year={selectedYear} 
            showCLPFormat={showCLPFormat}
          />
        </div>
      </div>

      {/* Instrucciones de uso */}
      <div className="p-6 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cómo usar la matriz de ingresos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Navegación y edición:</h4>
              <ul className="space-y-1">
                <li>• <kbd className="px-2 py-1 bg-gray-100 rounded">Click</kbd> en una celda para editar</li>
                <li>• <kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd> para confirmar cambios</li>
                <li>• <kbd className="px-2 py-1 bg-gray-100 rounded">Esc</kbd> para cancelar edición</li>
                <li>• <kbd className="px-2 py-1 bg-gray-100 rounded">Tab</kbd> para moverse entre celdas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Funciones avanzadas:</h4>
              <ul className="space-y-1">
                <li>• <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl/Cmd + V</kbd> para pegar desde Excel</li>
                <li>• Arrastra las categorías para reordenar</li>
                <li>• Los totales se actualizan automáticamente</li>
                <li>• Cambia entre formato CLP y números</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
