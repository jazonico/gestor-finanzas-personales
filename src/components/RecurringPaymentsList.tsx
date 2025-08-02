import React, { useState } from 'react';
import { useFinancialContext } from '../context/FinancialContext';
import { getCategoryIcon, getCategoryColor } from '../utils/categories';
import { Edit2, Trash2, Power, PowerOff } from 'lucide-react';
import RecurringPaymentForm from './RecurringPaymentForm';
import { RecurringPayment } from '../types';

const RecurringPaymentsList: React.FC = () => {
  const { recurringPayments, updateRecurringPayment, deleteRecurringPayment } = useFinancialContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<RecurringPayment | null>(null);

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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Pagos Activos ({activePayments.length})
          </h3>
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

      <RecurringPaymentForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        editingPayment={editingPayment || undefined}
      />
    </div>
  );
};

export default RecurringPaymentsList; 