import { supabase } from '../lib/supabase';
import { Transaction, RecurringPayment, SharedExpense } from '../types';

// Funciones de conversión entre tipos internos y de base de datos
const convertFromDbTransaction = (dbTransaction: any): Transaction => ({
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

const convertFromDbRecurringPayment = (dbPayment: any): RecurringPayment => ({
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

// Funciones de conversión para gastos compartidos
const convertFromDbSharedExpense = (dbExpense: any): SharedExpense => ({
  id: dbExpense.id,
  description: dbExpense.description,
  amount: dbExpense.amount,
  date: new Date(dbExpense.date),
  paidBy: dbExpense.paid_by,
  isShared: dbExpense.is_shared,
  sharedPercentage: dbExpense.shared_percentage,
  hasInstallments: dbExpense.has_installments,
  installmentsTotal: dbExpense.installments_total || undefined,
  installmentNumber: dbExpense.installment_number || undefined,
  parentExpenseId: dbExpense.parent_expense_id || undefined,
  createdAt: new Date(dbExpense.created_at),
  updatedAt: new Date(dbExpense.updated_at),
});

const convertToDbSharedExpense = (expense: Omit<SharedExpense, 'id' | 'createdAt' | 'updatedAt'>, userId: string) => ({
  user_id: userId,
  description: expense.description,
  amount: expense.amount,
  date: expense.date.toISOString().split('T')[0],
  paid_by: expense.paidBy,
  is_shared: expense.isShared,
  shared_percentage: expense.sharedPercentage,
  has_installments: expense.hasInstallments,
  installments_total: expense.installmentsTotal || null,
  installment_number: expense.installmentNumber || null,
  parent_expense_id: expense.parentExpenseId || null,
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

  // Funciones de gastos compartidos
  getSharedExpenses: async (month?: Date): Promise<SharedExpense[]> => {
    const user = await supabaseStorage.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    let query = supabase
      .from('shared_expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (month) {
      const year = month.getFullYear();
      const monthNum = month.getMonth() + 1;
      const startDate = `${year}-${monthNum.toString().padStart(2, '0')}-01`;
      const endDate = `${year}-${monthNum.toString().padStart(2, '0')}-31`;
      
      query = query.gte('date', startDate).lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data.map(convertFromDbSharedExpense);
  },

  addSharedExpense: async (expense: Omit<SharedExpense, 'id' | 'createdAt' | 'updatedAt'>): Promise<SharedExpense[]> => {
    const user = await supabaseStorage.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const expenses: SharedExpense[] = [];

    if (expense.hasInstallments && expense.installmentsTotal && expense.installmentsTotal > 1) {
      // Crear gasto principal
      const mainExpenseDb = convertToDbSharedExpense(expense, user.id);
      const { data: mainExpense, error: mainError } = await supabase
        .from('shared_expenses')
        .insert(mainExpenseDb)
        .select()
        .single();

      if (mainError) throw mainError;
      const mainExpenseConverted = convertFromDbSharedExpense(mainExpense);
      expenses.push(mainExpenseConverted);

      // Crear cuotas adicionales
      const installmentAmount = Math.round(expense.amount / expense.installmentsTotal);
      
      for (let i = 2; i <= expense.installmentsTotal; i++) {
        const installmentDate = new Date(expense.date);
        installmentDate.setMonth(installmentDate.getMonth() + (i - 1));
        
        const installmentExpense = {
          ...expense,
          amount: installmentAmount,
          date: installmentDate,
          installmentNumber: i,
          parentExpenseId: mainExpense.id,
        };

        const installmentDb = convertToDbSharedExpense(installmentExpense, user.id);
        const { data: installment, error: installmentError } = await supabase
          .from('shared_expenses')
          .insert(installmentDb)
          .select()
          .single();

        if (installmentError) throw installmentError;
        expenses.push(convertFromDbSharedExpense(installment));
      }

      // Actualizar el gasto principal con el número de cuota
      await supabase
        .from('shared_expenses')
        .update({ 
          installment_number: 1,
          amount: installmentAmount 
        })
        .eq('id', mainExpense.id);

      expenses[0] = { ...expenses[0], installmentNumber: 1, amount: installmentAmount };
    } else {
      // Crear gasto simple
      const dbExpense = convertToDbSharedExpense(expense, user.id);
      const { data, error } = await supabase
        .from('shared_expenses')
        .insert(dbExpense)
        .select()
        .single();

      if (error) throw error;
      expenses.push(convertFromDbSharedExpense(data));
    }

    return expenses;
  },

  updateSharedExpense: async (id: string, updates: Partial<SharedExpense>): Promise<SharedExpense> => {
    const user = await supabaseStorage.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const dbUpdates: any = {};
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.date) dbUpdates.date = updates.date.toISOString().split('T')[0];
    if (updates.paidBy) dbUpdates.paid_by = updates.paidBy;
    if (updates.isShared !== undefined) dbUpdates.is_shared = updates.isShared;
    if (updates.sharedPercentage !== undefined) dbUpdates.shared_percentage = updates.sharedPercentage;

    const { data, error } = await supabase
      .from('shared_expenses')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return convertFromDbSharedExpense(data);
  },

  deleteSharedExpense: async (id: string): Promise<void> => {
    const user = await supabaseStorage.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    // Si es un gasto padre, eliminar también las cuotas
    const { error: childrenError } = await supabase
      .from('shared_expenses')
      .delete()
      .eq('parent_expense_id', id)
      .eq('user_id', user.id);

    if (childrenError) throw childrenError;

    // Eliminar el gasto principal
    const { error } = await supabase
      .from('shared_expenses')
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