# 📊 Income Matrix - Matriz de Ingresos

Una interfaz tipo hoja de cálculo para gestionar ingresos mensuales con funcionalidades avanzadas de edición, navegación y análisis.

## 🚀 Características Principales

### ✨ Interfaz Excel-like
- **Tabla interactiva** con filas (tipos de ingreso) y columnas (meses)
- **Columna sticky** con nombres de categorías
- **Encabezado fijo** con meses del año
- **Totales automáticos** por fila, columna y global
- **Formateo CLP** con separadores de miles

### ⌨️ Navegación y Edición
- **Click** para editar celdas
- **Enter** para confirmar, **Esc** para cancelar
- **Tab/Shift+Tab** para moverse entre celdas
- **Flechas** para navegación direccional
- **Edición inline** con validación en tiempo real

### 📋 Funciones Avanzadas
- **Pegado desde Excel** (Ctrl/Cmd+V)
- **Drag & Drop** para reordenar categorías
- **Operaciones masivas** en filas completas
- **Debounce automático** (400ms) para persistencia
- **Edición optimista** con rollback en errores

## 🛠️ Uso Básico

### Importar y Usar el Componente

```tsx
import { IncomeMatrix } from '@/components/finance/IncomeMatrix';
import { IncomeToolbar } from '@/components/finance/IncomeToolbar';

function MyFinancePage() {
  const [year, setYear] = useState(2024);
  const [showCLP, setShowCLP] = useState(true);

  return (
    <div>
      <IncomeToolbar
        selectedYear={year}
        onYearChange={setYear}
        showCLPFormat={showCLP}
        onFormatToggle={setShowCLP}
        onAddCategory={() => {/* lógica personalizada */}}
      />
      
      <IncomeMatrix 
        year={year}
        showCLPFormat={showCLP}
      />
    </div>
  );
}
```

### Inicializar el Store

```tsx
import { useFinanceStore } from '@/store/useFinanceStore';

function App() {
  const { initialize } = useFinanceStore();
  
  useEffect(() => {
    initialize(); // Cargar datos iniciales
  }, []);
}
```

## 📡 Integración con Eventos

### Escuchar Cambios de Ingresos

```tsx
import { useFinanceStore } from '@/store/useFinanceStore';

function MyDashboard() {
  const { subscribe } = useFinanceStore();
  
  useEffect(() => {
    // Suscribirse a cambios de ingresos
    const unsubscribe = subscribe('income/updated', (event) => {
      console.log('Ingreso actualizado:', event.payload);
      // Actualizar gráficos, estadísticas, etc.
      updateCharts(event.payload);
    });
    
    return unsubscribe; // Cleanup
  }, []);
}
```

### Eventos Disponibles

- `income/updated` - Celda actualizada
- `income/category/added` - Categoría creada
- `income/category/renamed` - Categoría renombrada
- `income/category/deleted` - Categoría eliminada

## 🔗 Hooks Personalizados

### useIncomeMatrix(year)

```tsx
const {
  categories,           // Categorías ordenadas
  matrix,              // Datos de la matriz
  isLoading,           // Estado de carga
  error,               // Errores
  
  // Acciones de categorías
  createCategory,
  renameCategory,
  deleteCategory,
  reorderCategories,
  
  // Acciones de matriz
  setCell,
  setCellFromString,
  bulkSetRow,
  pasteExcelRow,
  
  // Utilidades
  getCellValue,
  clearError,
} = useIncomeMatrix(2024);
```

### useIncomeTotals(year)

```tsx
const {
  monthlyTotals,       // Totales por mes
  categoryTotals,      // Totales por categoría
  grandTotal,          // Total global
  
  // Estadísticas
  averageMonthly,
  highestMonth,
  lowestMonth,
  topCategories,
  
  // Utilidades
  getMonthTotal,
  getCategoryTotal,
  getCategoryPercentage,
} = useIncomeTotals(2024);
```

## 🔧 Configuración de Adapters

### Usar LocalStorage (por defecto)

```tsx
import { LocalAdapter } from '@/adapters/income/localAdapter';

// Ya configurado por defecto en el store
// No requiere configuración adicional
```

### Cambiar a API REST

```tsx
import { RestAdapter } from '@/adapters/income/restAdapter';
import { useFinanceStore } from '@/store/useFinanceStore';

// Cambiar adapter en runtime
const { adapter } = useFinanceStore.getState();
const newAdapter = new RestAdapter('/api/income', 'your-api-key');

// Actualizar el store con el nuevo adapter
useFinanceStore.setState({ adapter: newAdapter });
await newAdapter.initialize();
```

### Configurar Endpoints Personalizados

```tsx
const customAdapter = new RestAdapter('https://api.myapp.com/v1/finance');
```

## 📊 Selectores para Dashboards

```tsx
import { 
  selectYear, 
  getMonthlyTotals, 
  getAnnualTotalsByCategory,
  getGrandTotal 
} from '@/store/useFinanceStore';

function FinanceChart() {
  const monthlyData = useFinanceStore(getMonthlyTotals(2024));
  const categoryTotals = useFinanceStore(getAnnualTotalsByCategory(2024));
  const total = useFinanceStore(getGrandTotal(2024));
  
  return (
    <Chart data={monthlyData} />
  );
}
```

## 🎨 Personalización de Estilos

### Tailwind CSS Classes

```tsx
// Personalizar colores de la tabla
<IncomeMatrix 
  className="custom-matrix"
  headerClassName="bg-blue-100"
  cellClassName="hover:bg-blue-50"
/>
```

### CSS Variables

```css
:root {
  --income-matrix-primary: #3b82f6;
  --income-matrix-secondary: #f3f4f6;
  --income-matrix-success: #10b981;
  --income-matrix-error: #ef4444;
}
```

## 🧪 Testing

```bash
# Ejecutar tests
npm run test components/finance

# Tests con coverage
npm run test:coverage components/finance

# Tests en watch mode
npm run test:watch components/finance
```

### Ejemplo de Test

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { IncomeMatrix } from '@/components/finance/IncomeMatrix';

test('permite editar celdas', async () => {
  render(<IncomeMatrix year={2024} />);
  
  const cell = screen.getByText('500.000');
  fireEvent.click(cell);
  
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: '550000' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  
  expect(mockSetCell).toHaveBeenCalledWith('cat-1', 1, 550000);
});
```

## 🚀 Optimización de Rendimiento

### Memoización Automática
- Los selectores están memoizados con Zustand
- Re-renders mínimos en cambios de estado
- Debounce automático en ediciones

### Lazy Loading
```tsx
const LazyIncomeMatrix = lazy(() => import('@/components/finance/IncomeMatrix'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyIncomeMatrix year={2024} />
    </Suspense>
  );
}
```

## 🔒 Validación y Seguridad

### Validación con Zod
- Todos los inputs son validados
- Esquemas tipados con TypeScript
- Sanitización automática de datos

### Manejo de Errores
- Error boundaries automáticos
- Rollback en errores de persistencia
- Mensajes de error informativos

## 📝 Tipos TypeScript

```tsx
interface Category {
  id: string;
  name: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

interface IncomeMatrix {
  [categoryId: string]: {
    [month: number]: number; // 1-12
  };
}
```

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

---

¿Necesitas ayuda? Abre un [issue](https://github.com/tu-repo/issues) o consulta la [documentación completa](https://docs.tu-app.com).
