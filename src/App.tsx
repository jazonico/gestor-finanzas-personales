import { useState, useEffect } from 'react';
import { FinancialProvider } from './context/FinancialContext';
import { supabase } from './lib/supabase';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import RecurringPaymentsList from './components/RecurringPaymentsList';
import Auth from './components/Auth';
import LoadingSpinner from './components/LoadingSpinner';
import Debug from './debug';
import { User } from '@supabase/supabase-js';
import { LogOut } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Debug mode - mostrar variables de entorno si no están definidas
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return <Debug />;
  }

  useEffect(() => {
    // Obtener la sesión inicial
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'recurring':
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Pagos Recurrentes
                </h1>
                <p className="text-gray-600">
                  Gestiona tus pagos automáticos mensuales como alquiler, tarjetas de crédito, servicios y salarios.
                </p>
              </div>
              
              <div className="card">
                <RecurringPaymentsList />
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  // Mostrar spinner de carga inicial
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  // Mostrar pantalla de autenticación si no hay usuario
  if (!user) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  // Mostrar aplicación principal si hay usuario autenticado
  return (
    <FinancialProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header con información del usuario */}
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        {renderContent()}
      </div>
    </FinancialProvider>
  );
}

export default App; 