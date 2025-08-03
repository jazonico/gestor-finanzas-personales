import React, { useState } from 'react';
import { useFinancialContext } from '../context/FinancialContext';
import { getCategoryIcon, getCategoryColor } from '../utils/categories';
import { Edit2, Trash2, Power, PowerOff, Plus, DollarSign } from 'lucide-react';
import RecurringPaymentForm from './RecurringPaymentForm';
import { RecurringPayment } from '../types';

const RecurringPaymentsList: React.FC = () => {
  const { recurringPayments, updateRecurringPayment, deleteRecurringPayment, addTransaction } = useFinancialContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<RecurringPayment | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<RecurringPayment | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleEdit = (payment: RecurringPayment) => {
    setEditingPayment(payment);
    setIsFormOpen(true);
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    updateRecurringPayment(id, { isActive: !isActive });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el pago recurrente "${name}"?`)) {
      deleteRecurringPayment(id);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPayment(null);
  };

  const handleRegisterPayment = (payment: RecurringPayment) => {
    setSelectedPayment(payment);
    setPaymentAmount(payment.amount.toString());
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayment || !paymentAmount) return;

    try {
      await addTransaction({
        type: selectedPayment.type,
        category: selectedPayment.category,
        amount: parseFloat(paymentAmount),
        description: `${selectedPayment.name} - Pago registrado`,
        date: new Date(paymentDate),
        isRecurring: false,
      });

      setIsPaymentModalOpen(false);
      setSelectedPayment(null);
      setPaymentAmount('');
      
      // Mostrar confirmación
      alert(`✅ Pago de ${selectedPayment.name} registrado exitosamente por ${formatCurrency(parseFloat(paymentAmount))}`);
    } catch (error) {
      console.error('Error registrando pago:', error);
      alert('❌ Error al registrar el pago. Inténtalo de nuevo.');
    }
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedPayment(null);
    setPaymentAmount('');
  };

  if (recurringPayments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No hay pagos recurrentes configurados</p>
        <button
          onClick={() => setIsFormOpen(true)}
          className="btn-primary"
        >
          Agregar Primer Pago Recurrente
        </button>
        <RecurringPaymentForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          editingPayment={editingPayment || undefined}
        />
      </div>
    );
  }

  const activePayments = recurringPayments.filter(p => p.isActive);
  const inactivePayments = recurringPayments.filter(p => !p.isActive);

  return (
    <div className="space-y-6">
      {/* Pagos activos */}
      {activePayments.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Pagos Activos ({activePayments.length})
            </h3>
            <button
              onClick={() => setIsFormOpen(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Pago</span>
            </button>
          </div>
          <div className="space-y-3">
            {activePayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: getCategoryColor(payment.category, payment.type) }}
                  >
                    {getCategoryIcon(payment.category, payment.type)}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {payment.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {payment.category} • Día {payment.dayOfMonth} de cada mes
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`font-semibold ${
                      payment.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {payment.type === 'income' ? '+' : '-'}{formatCurrency(payment.amount)}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRegisterPayment(payment)}
                      className="p-2 text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 rounded"
                      title="Registrar Pago"
                    >
                      <DollarSign className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(payment.id, payment.isActive)}
                      className="p-2 text-green-600 hover:text-green-800 transition-colors"
                      title="Desactivar"
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(payment)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(payment.id, payment.name)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagos inactivos */}
      {inactivePayments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-500 mb-4">
            Pagos Inactivos ({inactivePayments.length})
          </h3>
          <div className="space-y-3">
            {inactivePayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg opacity-60"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: getCategoryColor(payment.category, payment.type) }}
                  >
                    {getCategoryIcon(payment.category, payment.type)}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700">
                      {payment.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {payment.category} • Día {payment.dayOfMonth} de cada mes
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-500">
                      {payment.type === 'income' ? '+' : '-'}{formatCurrency(payment.amount)}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleActive(payment.id, payment.isActive)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Activar"
                    >
                      <PowerOff className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(payment)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(payment.id, payment.name)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para registrar pago */}
      {isPaymentModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Registrar Pago: {selectedPayment.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Real del Pago
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Monto sugerido: {formatCurrency(selectedPayment.amount)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha del Pago
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Categoría:</strong> {selectedPayment.category}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Tipo:</strong> {selectedPayment.type === 'expense' ? 'Gasto' : 'Ingreso'}
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleClosePaymentModal}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Registrar Pago
              </button>
            </div>
          </div>
        </div>
      )}

      <RecurringPaymentForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        editingPayment={editingPayment || undefined}
      />
    </div>
  );
};

export default RecurringPaymentsList; 