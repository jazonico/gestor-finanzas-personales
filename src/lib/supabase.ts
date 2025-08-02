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

// Crear la instancia de Supabase directamente si está configurada
let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured()) {
  try {
    supabaseInstance = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    console.log('✅ Supabase client created successfully');
  } catch (error) {
    console.error('❌ Error creating Supabase client:', error);
  }
}

// Export directo de la instancia
export const supabase = supabaseInstance!; 