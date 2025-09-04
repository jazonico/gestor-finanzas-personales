/**
 * Versión simplificada para debug de la matriz de ingresos
 */

import { useEffect, useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';

export default function IncomeMatrixSimple() {
  const [status, setStatus] = useState('Inicializando...');
  const [error, setError] = useState<string | null>(null);
  const store = useFinanceStore();

  useEffect(() => {
    const init = async () => {
      try {
        setStatus('Inicializando store...');
        console.log('🔄 Iniciando IncomeMatrixSimple');
        
        await store.initialize();
        
        setStatus('Store inicializado correctamente');
        console.log('✅ Store inicializado en componente');
        console.log('Categorías:', store.incomeCategories);
        console.log('Matriz:', store.incomeMatrix);
        
      } catch (err) {
        console.error('❌ Error en componente:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setStatus('Error en inicialización');
      }
    };

    init();
  }, []); // Remover la dependencia 'store' que causaba el bucle infinito

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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Income Matrix - Versión Simple</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Estado: {status}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Información del Store:</h3>
              <ul className="text-sm space-y-1">
                <li>Año seleccionado: {store.selectedYear}</li>
                <li>Categorías: {store.incomeCategories.length}</li>
                <li>Años en matriz: {Object.keys(store.incomeMatrix).length}</li>
                <li>Cargando: {store.isLoading ? 'Sí' : 'No'}</li>
                <li>Error: {store.error || 'Ninguno'}</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Categorías:</h3>
              <ul className="text-sm space-y-1">
                {store.incomeCategories.map(cat => (
                  <li key={cat.id}>• {cat.name} (orden: {cat.order})</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {store.incomeCategories.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Matriz de Datos</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2">Categoría</th>
                    <th className="border border-gray-300 px-4 py-2">Ene</th>
                    <th className="border border-gray-300 px-4 py-2">Feb</th>
                    <th className="border border-gray-300 px-4 py-2">Mar</th>
                    <th className="border border-gray-300 px-4 py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {store.incomeCategories.map(category => {
                    const categoryData = store.incomeMatrix[store.selectedYear]?.[category.id] || {};
                    const total = Object.values(categoryData).reduce((sum, val) => sum + val, 0);
                    
                    return (
                      <tr key={category.id}>
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          {category.name}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {categoryData[1] ? categoryData[1].toLocaleString() : '-'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {categoryData[2] ? categoryData[2].toLocaleString() : '-'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {categoryData[3] ? categoryData[3].toLocaleString() : '-'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                          {total > 0 ? total.toLocaleString() : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
