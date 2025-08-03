import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SharedExpense } from '../types';

interface SharedExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expense: Omit<SharedExpense, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editingExpense?: SharedExpense;
}

const SharedExpenseForm: React.FC<SharedExpenseFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingExpense,
}) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paidBy: 'Felipe' as 'Felipe' | 'Camila',
    isShared: true,
    sharedPercentage: 50,
    hasInstallments: false,
    installmentsTotal: 1,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        description: editingExpense.description,
        amount: editingExpense.amount.toString(),
        date: editingExpense.date.toISOString().split('T')[0],
        paidBy: editingExpense.paidBy,
        isShared: editingExpense.isShared,
        sharedPercentage: editingExpense.sharedPercentage,
        hasInstallments: editingExpense.hasInstallments,
        installmentsTotal: editingExpense.installmentsTotal || 1,
      });
    } else {
      setFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paidBy: 'Felipe',
        isShared: true,
        sharedPercentage: 50,
        hasInstallments: false,
        installmentsTotal: 1,
      });
    }
  }, [editingExpense, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim() || !formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Por favor, completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        description: formData.description.trim(),
        amount: parseInt(formData.amount),
        date: new Date(formData.date),
        paidBy: formData.paidBy,
        isShared: formData.isShared,
        sharedPercentage: formData.sharedPercentage,
        hasInstallments: formData.hasInstallments,
        installmentsTotal: formData.hasInstallments ? formData.installmentsTotal : undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error submitting expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateSharedAmounts = () => {
    const amount = parseFloat(formData.amount) || 0;
    if (!formData.isShared) return { felipe: 0, camila: 0 };
    
    const felipeShare = Math.round(amount * (formData.sharedPercentage / 100));
    const camilaShare = amount - felipeShare;
    
    return { felipe: felipeShare, camila: camilaShare };
  };

  if (!isOpen) return null;

  const sharedAmounts = calculateSharedAmounts();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {editingExpense ? 'Editar Gasto' : 'Nuevo Gasto Compartido'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Supermercado, Luz, Internet..."
              required
            />
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto (CLP) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="1"
                required
              />
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Quién pagó */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quién pagó *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paidBy: 'Felipe' })}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  formData.paidBy === 'Felipe'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Felipe
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paidBy: 'Camila' })}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  formData.paidBy === 'Camila'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Camila
              </button>
            </div>
          </div>

          {/* ¿Gasto compartido? */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.isShared}
                onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">¿Gasto compartido?</span>
            </label>
          </div>

          {/* Porcentaje compartido */}
          {formData.isShared && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Porcentaje compartido: {formData.sharedPercentage}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.sharedPercentage}
                onChange={(e) => setFormData({ ...formData, sharedPercentage: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Felipe: {100 - formData.sharedPercentage}%</span>
                <span>Camila: {formData.sharedPercentage}%</span>
              </div>
              {formData.amount && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Felipe debe:</strong> {formatCurrency(sharedAmounts.felipe)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Camila debe:</strong> {formatCurrency(sharedAmounts.camila)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ¿En cuotas? */}
          {!editingExpense && (
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.hasInstallments}
                  onChange={(e) => setFormData({ ...formData, hasInstallments: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">¿Dividir en cuotas?</span>
              </label>
            </div>
          )}

          {/* Número de cuotas */}
          {formData.hasInstallments && !editingExpense && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de cuotas
              </label>
              <input
                type="number"
                value={formData.installmentsTotal}
                onChange={(e) => setFormData({ ...formData, installmentsTotal: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="2"
                max="24"
              />
              {formData.amount && formData.installmentsTotal > 1 && (
                <p className="text-xs text-gray-500 mt-1">
                  Cada cuota: {formatCurrency(Math.round(parseInt(formData.amount) / formData.installmentsTotal))}
                </p>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : (editingExpense ? 'Actualizar' : 'Crear Gasto')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SharedExpenseForm; 