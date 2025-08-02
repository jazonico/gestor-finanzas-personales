import { format, startOfMonth, endOfMonth, isSameMonth, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

export const dateUtils = {
  formatDate: (date: Date): string => {
    return format(date, 'dd/MM/yyyy', { locale: es });
  },

  formatMonth: (date: Date): string => {
    return format(date, 'MMMM yyyy', { locale: es });
  },

  formatMonthShort: (date: Date): string => {
    return format(date, 'MMM yyyy', { locale: es });
  },

  getCurrentMonth: (): Date => {
    return startOfMonth(new Date());
  },

  getPreviousMonth: (): Date => {
    return startOfMonth(subMonths(new Date(), 1));
  },

  getNextMonth: (): Date => {
    return startOfMonth(addMonths(new Date(), 1));
  },

  isCurrentMonth: (date: Date): boolean => {
    return isSameMonth(date, new Date());
  },

  getMonthStart: (date: Date): Date => {
    return startOfMonth(date);
  },

  getMonthEnd: (date: Date): Date => {
    return endOfMonth(date);
  },

  generateId: (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
}; 