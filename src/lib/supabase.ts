import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Variables de configuración
const getSupabaseConfig = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('🔍 Debug Supabase Config:', {
    url: supabaseUrl || 'undefined',
    key: supabaseAnonKey ? 'definida' : 'undefined',
    env: import.meta.env.MODE
  });
  
  return { supabaseUrl, supabaseAnonKey };
};

// Función para verificar si Supabase está configurado correctamente
export const isSupabaseConfigured = () => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  return !!(supabaseUrl && supabaseAnonKey);
};

// Instancia lazy de Supabase
let supabaseInstance: SupabaseClient | null = null;

const createSupabaseClient = (): SupabaseClient => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('❌ Supabase configuration is missing');
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    console.log('✅ Supabase client created successfully');
    return supabaseInstance;
  } catch (error) {
    console.error('❌ Error creating Supabase client:', error);
    throw error;
  }
};

// Proxy object que crea el cliente solo cuando se accede a él
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = createSupabaseClient();
    const value = (client as any)[prop];
    
    if (typeof value === 'function') {
      return value.bind(client);
    }
    
    return value;
  }
}); 