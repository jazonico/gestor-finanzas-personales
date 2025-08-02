import React, { useState } from 'react';
import { RecurringPayment } from '../types';
import { useFinancialContext } from '../context/FinancialContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categories';
import { X } from 'lucide-react';

interface RecurringPaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingPayment?: RecurringPayment;
}

const RecurringPaymentForm: React.FC<RecurringPaymentFormProps> = ({
  isOpen,
  onClose,
  editingPayment,
}) => {
  const { addRecurringPayment, updateRecurringPayment } = useFinancialContext();

  const [formData, setFormData] = useState({
    name: editingPayment?.name || '',
    type: editingPayment?.type || 'expense' as 'income' | 'expense',
    category: editingPayment?.category || '',
    amount: editingPayment?.amount || 0,
    dayOfMonth: editingPayment?.dayOfMonth || 1,
    isActive: editingPayment?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es obligatoria';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }

    if (formData.dayOfMonth < 1 || formData.dayOfMonth > 31) {
      newErrors.dayOfMonth = 'El día debe estar entre 1 y 31';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const paymentData = {
      name: formData.name,
      type: formData.type,
      category: formData.category,
      amount: Number(formData.amount),
      dayOfMonth: formData.dayOfMonth,
      isActive: formData.isActive,
    };

    if (editingPayment) {
      updateRecurringPayment(editingPayment.id, paymentData);
    } else {
      addRecurringPayment(paymentData);
    }

    onClose();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'expense',
      category: '',
      amount: 0,
      dayOfMonth: 1,
      isActive: true,
    });
    setErrors({});
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {editingPayment ? 'Editar Pago Recurrente' : 'Nuevo Pago Recurrente'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Pago
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`input-field ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Ej: Alquiler, Tarjeta de crédito, Salario"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'expense', category: '' })}
                  className="mr-2"
                />
                <span className="text-red-600">Gasto</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income', category: '' })}
                  className="mr-2"
                />
                <span className="text-green-600">Ingreso</span>
              </label>
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`input-field ${errors.category ? 'border-red-500' : ''}`}
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category}</p>
            )}
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              className={`input-field ${errors.amount ? 'border-red-500' : ''}`}
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Día del mes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Día del Mes
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={formData.dayOfMonth}
              onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) || 1 })}
              className={`input-field ${errors.dayOfMonth ? 'border-red-500' : ''}`}
            />
            {errors.dayOfMonth && (
              <p className="text-red-500 text-xs mt-1">{errors.dayOfMonth}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              El día del mes en que se debe procesar este pago
            </p>
          </div>

          {/* Estado activo */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                Pago activo
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Los pagos activos se agregan automáticamente cada mes
            </p>
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              {editingPayment ? 'Actualizar' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecurringPaymentForm; 