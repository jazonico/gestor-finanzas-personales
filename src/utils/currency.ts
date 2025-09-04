/**
 * Utilidades para formateo y parseo de moneda chilena (CLP)
 * Movido a src/utils para compatibilidad con Vite
 */

/**
 * Formatea un número como moneda chilena
 * @param value - Valor numérico a formatear
 * @param showSymbol - Si mostrar el símbolo $ (default: true)
 * @returns Cadena formateada (ej: "$1.234.567")
 */
export function formatCLP(value: number, showSymbol: boolean = true): string {
  if (isNaN(value) || value === 0) return '';
  
  const formatted = new Intl.NumberFormat('es-CL', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value));

  return showSymbol ? `$${formatted}` : formatted;
}

/**
 * Parsea una cadena de moneda a número
 * @param value - Cadena a parsear (puede incluir $, puntos, comas)
 * @returns Número parseado o 0 si es inválido
 */
export function parseCLP(value: string): number {
  if (!value || typeof value !== 'string') return 0;
  
  // Remover símbolos de moneda y espacios
  const cleaned = value
    .replace(/[$\s]/g, '')
    .replace(/\./g, '') // Remover separadores de miles
    .replace(/,/g, '.'); // Convertir comas decimales a puntos
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.max(0, Math.round(parsed));
}

/**
 * Sanitiza una entrada de usuario para valores monetarios
 * @param input - Entrada del usuario
 * @returns Valor sanitizado como string
 */
export function sanitizeMoneyInput(input: string): string {
  if (!input) return '';
  
  // Permitir solo números, puntos, comas, espacios y $
  return input.replace(/[^0-9.,\s$]/g, '');
}

/**
 * Valida si una cadena representa un valor monetario válido
 * @param value - Cadena a validar
 * @returns true si es válida, false en caso contrario
 */
export function isValidMoneyString(value: string): boolean {
  if (!value) return true; // Cadena vacía es válida (representa 0)
  
  const parsed = parseCLP(value);
  return !isNaN(parsed) && parsed >= 0;
}

/**
 * Formatea un valor para mostrar en input de edición
 * @param value - Valor numérico
 * @returns String para mostrar en el input
 */
export function formatForInput(value: number): string {
  if (value === 0) return '';
  return value.toString();
}

/**
 * Convierte un array de valores de Excel/CSV a números
 * @param values - Array de strings de Excel
 * @returns Array de números parseados
 */
export function parseExcelValues(values: string[]): number[] {
  return values.map(value => {
    // Manejar valores de Excel que pueden venir con diferentes formatos
    if (!value || value.trim() === '') return 0;
    
    // Si es un número directo
    const directNumber = parseFloat(value);
    if (!isNaN(directNumber)) return Math.max(0, Math.round(directNumber));
    
    // Si es formato de moneda
    return parseCLP(value);
  });
}

/**
 * Formatea totales grandes con sufijos (K, M)
 * @param value - Valor a formatear
 * @returns String formateado con sufijo si aplica
 */
export function formatLargeNumber(value: number): string {
  if (value === 0) return '$0';
  
  const absValue = Math.abs(value);
  
  if (absValue >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  
  if (absValue >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  
  return formatCLP(value);
}
