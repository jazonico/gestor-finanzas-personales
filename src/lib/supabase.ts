import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Debug Supabase Config:', {
  url: supabaseUrl || 'undefined',
  key: supabaseAnonKey ? 'definida' : 'undefined',
  env: import.meta.env.MODE
});

// Función para verificar si Supabase está configurado correctamente
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Crear el cliente de Supabase con configuración mínima y estable
let supabaseInstance: SupabaseClient | null = null;

const createSupabaseClient = (): SupabaseClient => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('❌ Supabase configuration is missing');
  }

  try {
    console.log('🔧 Creating Supabase client...');
    
    // Configuración mínima y estable
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('✅ Supabase client created successfully');
    return supabaseInstance;
  } catch (error) {
    console.error('❌ Error creating Supabase client:', error);
    throw error;
  }
};

// Export directo del cliente
export const supabase = createSupabaseClient(); 