import React, { useState } from 'react';
import { Transaction } from '../types';
import { useFinancialContext } from '../context/FinancialContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categories';
import { X, FileText, Calendar } from 'lucide-react';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: Transaction;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  editingTransaction,
}) => {
  const { addTransaction, updateTransaction } = useFinancialContext();

  const [formData, setFormData] = useState({
    type: editingTransaction?.type || 'expense' as 'income' | 'expense',
    category: editingTransaction?.category || '',
    amount: editingTransaction?.amount || 0,
    description: editingTransaction?.description || '',
    date: editingTransaction?.date ? editingTransaction.date.toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0],
    // Campos de facturación
    requiresInvoice: editingTransaction?.requiresInvoice || false,
    invoiceDueDate: editingTransaction?.invoiceDueDate ? 
                   editingTransaction.invoiceDueDate.toISOString().split('T')[0] : '',
    invoiceStatus: editingTransaction?.invoiceStatus || 'pending',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const categories = formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) {
      newErrors.category = 'La categoría es obligatoria';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }

    if (!formData.date) {
      newErrors.date = 'La fecha es obligatoria';
    }

    // Validación de facturación
    if (formData.requiresInvoice && !formData.invoiceDueDate) {
      newErrors.invoiceDueDate = 'La fecha límite para la factura es obligatoria';
    }

    // Validar que la fecha de factura sea antes o igual a la fecha de pago/ingreso
    if (formData.requiresInvoice && formData.invoiceDueDate && formData.date) {
      const invoiceDate = new Date(formData.invoiceDueDate);
      const paymentDate = new Date(formData.date);
      
      if (invoiceDate > paymentDate) {
        newErrors.invoiceDueDate = 'La fecha de factura debe ser anterior o igual a la fecha de pago';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const transactionData = {
        type: formData.type,
        category: formData.category,
        amount: Number(formData.amount),
        description: formData.description,
        date: new Date(formData.date),
        // Campos de facturación
        requiresInvoice: formData.requiresInvoice,
        invoiceDueDate: formData.requiresInvoice && formData.invoiceDueDate ? 
                       new Date(formData.invoiceDueDate) : undefined,
        invoiceStatus: formData.requiresInvoice ? formData.invoiceStatus : undefined,
      };

      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, transactionData);
      } else {
        await addTransaction(transactionData);
      }

      onClose();
      resetForm();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Error al guardar la transacción' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      category: '',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      requiresInvoice: false,
      invoiceDueDate: '',
      invoiceStatus: 'pending',
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
            {editingTransaction ? 'Editar Transacción' : 'Nueva Transacción'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error general */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Tipo de transacción */}
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
                  disabled={loading}
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
                  disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`input-field ${errors.description ? 'border-red-500' : ''}`}
              placeholder="Descripción de la transacción"
              disabled={loading}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={`input-field ${errors.date ? 'border-red-500' : ''}`}
              disabled={loading}
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date}</p>
            )}
          </div>

          {/* Sección de Facturación */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-medium text-gray-900">Gestión de Facturas/Boletas</h3>
            </div>
            
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="requiresInvoice"
                checked={formData.requiresInvoice}
                onChange={(e) => setFormData({ ...formData, requiresInvoice: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                disabled={loading}
              />
              <div>
                <label htmlFor="requiresInvoice" className="text-sm font-medium text-gray-700">
                  {formData.type === 'income' ? 'Requiere hacer factura/boleta' : 'Requiere comprobante de pago'}
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.type === 'income' 
                    ? 'Marca esta opción si necesitas hacer una factura o boleta para recibir este ingreso'
                    : 'Marca esta opción si necesitas un comprobante específico para este gasto'
                  }
                </p>
              </div>
            </div>

            {formData.requiresInvoice && (
              <div className="mt-4 space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Fecha límite para {formData.type === 'income' ? 'hacer la factura/boleta' : 'obtener comprobante'}
                  </label>
                  <input
                    type="date"
                    value={formData.invoiceDueDate}
                    onChange={(e) => setFormData({ ...formData, invoiceDueDate: e.target.value })}
                    className={`input-field ${errors.invoiceDueDate ? 'border-red-500' : ''}`}
                    disabled={loading}
                    max={formData.date} // No puede ser después de la fecha de pago
                  />
                  {errors.invoiceDueDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.invoiceDueDate}</p>
                  )}
                  <p className="text-xs text-gray-600 mt-1">
                    Fecha en que debes {formData.type === 'income' ? 'hacer la factura' : 'obtener el comprobante'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado actual
                  </label>
                  <select
                    value={formData.invoiceStatus}
                    onChange={(e) => setFormData({ ...formData, invoiceStatus: e.target.value as 'pending' | 'completed' | 'overdue' })}
                    className="input-field"
                    disabled={loading}
                  >
                    <option value="pending">📄 Pendiente - Aún no {formData.type === 'income' ? 'hecha' : 'obtenida'}</option>
                    <option value="completed">✅ Completada - Ya {formData.type === 'income' ? 'hecha' : 'obtenida'}</option>
                    <option value="overdue">⚠️ Vencida - Pasó la fecha límite</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`btn-primary flex-1 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingTransaction ? 'Actualizando...' : 'Agregando...'}
                </div>
              ) : (
                editingTransaction ? 'Actualizar' : 'Agregar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm; 