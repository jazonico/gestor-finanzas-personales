export const EXPENSE_CATEGORIES = [
  { name: 'Alimentación', color: '#ef4444', icon: '🍽️' },
  { name: 'Transporte', color: '#f97316', icon: '🚗' },
  { name: 'Vivienda', color: '#eab308', icon: '🏠' },
  { name: 'Servicios', color: '#22c55e', icon: '💡' },
  { name: 'Salud', color: '#06b6d4', icon: '🏥' },
  { name: 'Entretenimiento', color: '#8b5cf6', icon: '🎬' },
  { name: 'Ropa', color: '#ec4899', icon: '👕' },
  { name: 'Educación', color: '#10b981', icon: '📚' },
  { name: 'Tarjetas de Crédito', color: '#dc2626', icon: '💳' },
  { name: 'Otros Gastos', color: '#6b7280', icon: '📝' },
];

export const INCOME_CATEGORIES = [
  { name: 'Salario', color: '#059669', icon: '💼' },
  { name: 'Freelance', color: '#0d9488', icon: '💻' },
  { name: 'Inversiones', color: '#7c3aed', icon: '📈' },
  { name: 'Negocios', color: '#dc2626', icon: '🏪' },
  { name: 'Alquiler', color: '#ea580c', icon: '🏘️' },
  { name: 'Otros Ingresos', color: '#6b7280', icon: '💰' },
];

export const getCategoryColor = (categoryName: string, type: 'income' | 'expense'): string => {
  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const category = categories.find(cat => cat.name === categoryName);
  return category?.color || '#6b7280';
};

export const getCategoryIcon = (categoryName: string, type: 'income' | 'expense'): string => {
  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const category = categories.find(cat => cat.name === categoryName);
  return category?.icon || '📝';
}; 