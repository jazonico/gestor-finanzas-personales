/**
 * Componente temporal de debug para la matriz de ingresos
 */

import { useEffect, useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';

export default function IncomeMatrixDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  
  const store = useFinanceStore();

  useEffect(() => {
    const initializeDebug = async () => {
      try {
        console.log('🔍 Iniciando debug de Income Matrix...');
        console.log('Store inicial:', store);
        
        // Intentar inicializar
        await store.initialize();
        
        console.log('✅ Store inicializado correctamente');
        console.log('Categorías:', store.incomeCategories);
        console.log('Matriz:', store.incomeMatrix);
        
        setDebugInfo({
          selectedYear: store.selectedYear,
          categoriesCount: store.incomeCategories.length,
          matrixKeys: Object.keys(store.incomeMatrix),
          isLoading: store.isLoading,
          error: store.error,
        });
      } catch (err) {
        console.error('❌ Error en inicialización:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    };

    initializeDebug();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug: Income Matrix</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Estado del Store</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Store Completo</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm max-h-96">
            {JSON.stringify({
              selectedYear: store.selectedYear,
              incomeCategories: store.incomeCategories,
              incomeMatrix: store.incomeMatrix,
              isLoading: store.isLoading,
              error: store.error,
            }, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">LocalStorage</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify({
              categories: localStorage.getItem('finance_income_categories'),
              matrix: localStorage.getItem(`finance_income_matrix_${new Date().getFullYear()}`),
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
