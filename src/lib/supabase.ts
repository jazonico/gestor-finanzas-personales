import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Valores por defecto para evitar errores
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'placeholder-key';

console.log('🔍 Debug Supabase Config:', {
  url: supabaseUrl || 'undefined',
  key: supabaseAnonKey ? 'definida' : 'undefined',
  env: import.meta.env.MODE
});

export const supabase = createClient(
  supabaseUrl || fallbackUrl,
  supabaseAnonKey || fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'gestor-finanzas-personales'
      }
    }
  }
);

// Función para verificar si Supabase está configurado correctamente
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
}; 