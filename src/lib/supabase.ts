import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Debug Supabase Config:', {
  url: supabaseUrl || 'undefined',
  key: supabaseAnonKey ? 'definida' : 'undefined',
  env: import.meta.env.MODE
});

let supabaseInstance: SupabaseClient | null = null;

// Función para obtener la instancia de Supabase de forma lazy
export const getSupabase = () => {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration is missing');
    }
    
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseInstance;
};

// Función para verificar si Supabase está configurado correctamente
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Export para compatibilidad hacia atrás
export const supabase = {
  get auth() {
    return getSupabase().auth;
  },
  from(table: string) {
    return getSupabase().from(table);
  }
}; 