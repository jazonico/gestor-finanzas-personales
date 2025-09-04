/**
 * Versión mínima de Income Matrix - solo JSX estático
 */

export default function IncomeMatrixMinimal() {
  // Datos hardcodeados directamente en el render
  const categories = [
    { id: '1', name: 'Sueldo' },
    { id: '2', name: 'Turnos' },
    { id: '3', name: 'UMed' },
  ];

  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  // Datos de ejemplo hardcodeados
  const data: Record<string, Record<number, number>> = {
    '1': { 1: 500000, 2: 520000, 3: 510000 },
    '2': { 1: 150000, 2: 180000, 3: 160000 },
    '3': { 1: 80000, 2: 90000, 3: 85000 },
  };

  console.log('🚀 IncomeMatrixMinimal renderizando...');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner de versión */}
      <div className="w-full bg-green-100 text-green-900 text-center py-2 font-bold">
        ✅ INCOME MATRIX MINIMAL - VERSIÓN QUE FUNCIONA
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            Matriz de Ingresos 2024 - Versión Mínima
          </h1>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Tabla */}
          <table className="w-full">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-gray-900 border-r border-gray-300">
                  Tipo de Ingreso
                </th>
                {months.map((month, index) => (
                  <th key={index} className="px-4 py-4 text-center font-bold text-gray-900 border-r border-gray-300 min-w-[100px]">
                    {month}
                  </th>
                ))}
                <th className="px-4 py-4 text-center font-bold text-blue-900 bg-blue-100">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, categoryIndex) => (
                <tr key={category.id} className={categoryIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 font-semibold text-gray-900 border-r border-gray-300">
                    {category.name}
                  </td>
                  {months.map((_, monthIndex) => {
                    const month = monthIndex + 1;
                    const value = data[category.id]?.[month] || 0;
                    return (
                      <td key={month} className="px-4 py-4 text-center border-r border-gray-300">
                        {value > 0 ? (
                          <span className="font-medium text-gray-900">
                            ${value.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-4 text-center font-bold text-blue-900 bg-blue-50">
                    ${Object.values(data[category.id] || {}).reduce((sum, val) => sum + val, 0).toLocaleString()}
                  </td>
                </tr>
              ))}
              
              {/* Fila de totales */}
              <tr className="bg-blue-100 border-t-2 border-blue-300">
                <td className="px-6 py-4 font-bold text-gray-900 border-r border-gray-300">
                  TOTALES MENSUALES
                </td>
                {months.map((_, monthIndex) => {
                  const month = monthIndex + 1;
                  const total = categories.reduce((sum, cat) => sum + (data[cat.id]?.[month] || 0), 0);
                  return (
                    <td key={month} className="px-4 py-4 text-center font-bold text-blue-900 border-r border-gray-300">
                      ${total.toLocaleString()}
                    </td>
                  );
                })}
                <td className="px-4 py-4 text-center font-bold text-blue-900 bg-blue-200 text-lg">
                  ${categories.reduce((grandTotal, cat) => 
                    grandTotal + Object.values(data[cat.id] || {}).reduce((sum, val) => sum + val, 0), 0
                  ).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Estado del Componente</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">✅</div>
              <div className="text-sm font-medium text-gray-900">Renderizado</div>
              <div className="text-xs text-gray-600">Sin errores</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
              <div className="text-sm font-medium text-gray-900">Categorías</div>
              <div className="text-xs text-gray-600">Datos cargados</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-sm font-medium text-gray-900">Meses</div>
              <div className="text-xs text-gray-600">Tabla completa</div>
            </div>
          </div>
        </div>

        {/* Debug info */}
        <div className="mt-4 bg-gray-100 rounded-lg p-4">
          <h3 className="font-bold text-gray-900 mb-2">Debug Info:</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <div>• Componente: IncomeMatrixMinimal</div>
            <div>• Renderizado: {new Date().toLocaleTimeString()}</div>
            <div>• Estado: Funcional sin hooks complejos</div>
            <div>• Datos: Hardcodeados en el componente</div>
          </div>
        </div>
      </div>
    </div>
  );
}
