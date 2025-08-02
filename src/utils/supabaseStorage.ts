import { supabase } from '../lib/supabase';
import { Transaction, RecurringPayment } from '../types';
import { Database } from '../types/database';

type TransactionRow = Database['public']['Tables']['transactions']['Row'];
type RecurringPaymentRow = Database['public']['Tables']['recurring_payments']['Row'];

// Funciones de conversión entre tipos internos y de base de datos
const convertFromDbTransaction = (dbTransaction: TransactionRow): Transaction => ({
  id: dbTransaction.id,
  type: dbTransaction.type,
  category: dbTransaction.category,
  amount: dbTransaction.amount,
  description: dbTransaction.description,
  date: new Date(dbTransaction.date),
  isRecurring: dbTransaction.is_recurring,
  recurringDay: dbTransaction.recurring_day || undefined,
});

const convertToDbTransaction = (transaction: Omit<Transaction, 'id'>, userId: string) => ({
  user_id: userId,
  type: transaction.type,
  category: transaction.category,
  amount: transaction.amount,
  description: transaction.description,
  date: transaction.date.toISOString().split('T')[0],
  is_recurring: transaction.isRecurring || false,
  recurring_day: transaction.recurringDay || null,
});

const convertFromDbRecurringPayment = (dbPayment: RecurringPaymentRow): RecurringPayment => ({
  id: dbPayment.id,
  name: dbPayment.name,
  amount: dbPayment.amount,
  category: dbPayment.category,
  dayOfMonth: dbPayment.day_of_month,
  isActive: dbPayment.is_active,
  type: dbPayment.type,
});

const convertToDbRecurringPayment = (payment: Omit<RecurringPayment, 'id'>, userId: string) => ({
  user_id: userId,
  name: payment.name,
  amount: payment.amount,
  category: payment.category,
  day_of_month: payment.dayOfMonth,
  is_active: payment.isActive,
  type: payment.type,
});

export const supabaseStorage = {
  // Funciones de autenticación
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  signUp: async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });
    if (error) throw error;
    return data;
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Funciones de transacciones
  getTransactions: async (): Promise<Transaction[]> => {
    const user = await supabaseStorage.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) throw error;
    return data.map(convertFromDbTransaction);
  },

  addTransaction: async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const user = await supabaseStorage.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const dbTransaction = convertToDbTransaction(transaction, user.id);
    const { data, error } = await supabase
      .from('transactions')
      .insert(dbTransaction)
      .select()
      .single();

    if (error) throw error;
    return convertFromDbTransaction(data);
  },

  updateTransaction: async (id: string, updates: Partial<Transaction>): Promise<Transaction> => {
    const user = await supabaseStorage.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const dbUpdates: any = {};
    if (updates.type) dbUpdates.type = updates.type;
    if (updates.category) dbUpdates.category = updates.category;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.date) dbUpdates.date = updates.date.toISOString().split('T')[0];
    if (updates.isRecurring !== undefined) dbUpdates.is_recurring = updates.isRecurring;
    if (updates.recurringDay !== undefined) dbUpdates.recurring_day = updates.recurringDay;

    const { data, error } = await supabase
      .from('transactions')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return convertFromDbTransaction(data);
  },

  deleteTransaction: async (id: string): Promise<void> => {
    const user = await supabaseStorage.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  // Funciones de pagos recurrentes
  getRecurringPayments: async (): Promise<RecurringPayment[]> => {
    const user = await supabaseStorage.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('recurring_payments')
      .select('*')
      .eq('user_id', user.id)
      .order('name');

    if (error) throw error;
    return data.map(convertFromDbRecurringPayment);
  },

  addRecurringPayment: async (payment: Omit<RecurringPayment, 'id'>): Promise<RecurringPayment> => {
    const user = await supabaseStorage.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const dbPayment = convertToDbRecurringPayment(payment, user.id);
    const { data, error } = await supabase
      .from('recurring_payments')
      .insert(dbPayment)
      .select()
      .single();

    if (error) throw error;
    return convertFromDbRecurringPayment(data);
  },

  updateRecurringPayment: async (id: string, updates: Partial<RecurringPayment>): Promise<RecurringPayment> => {
    const user = await supabaseStorage.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.category) dbUpdates.category = updates.category;
    if (updates.dayOfMonth !== undefined) dbUpdates.day_of_month = updates.dayOfMonth;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.type) dbUpdates.type = updates.type;

    const { data, error } = await supabase
      .from('recurring_payments')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return convertFromDbRecurringPayment(data);
  },

  deleteRecurringPayment: async (id: string): Promise<void> => {
    const user = await supabaseStorage.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('recurring_payments')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  // Función para crear/actualizar perfil
  upsertProfile: async (userId: string, email: string, fullName?: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email,
        full_name: fullName || null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
}; 