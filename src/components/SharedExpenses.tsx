import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Users, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useSharedExpenses } from '../hooks/useSharedExpenses';
import SharedExpenseForm from './SharedExpenseForm';
import LoadingSpinner from './LoadingSpinner';
import { SharedExpense } from '../types';

const SharedExpenses: React.FC = () => {
  const {
    expenses,
    loading,
    error,
    currentMonth,
    balance,
    formatCurrency,
    formatMonth,
    addExpense,
    updateExpense,
    deleteExpense,
    goToPreviousMonth,
    goToNextMonth,
  } = useSharedExpenses();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<SharedExpense | null>(null);

  const handleAddExpense = async (expenseData: Omit<SharedExpense, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addExpense(expenseData);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleEditExpense = async (expenseData: Omit<SharedExpense, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingExpense) return;
    
    try {
      await updateExpense(editingExpense.id, expenseData);
      setEditingExpense(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleDeleteExpense = async (expense: SharedExpense) => {
    const confirmMessage = expense.hasInstallments && expense.installmentNumber === 1
      ? `¿Estás seguro de que quieres eliminar "${expense.description}" y todas sus cuotas?`
      : `¿Estás seguro de que quieres eliminar "${expense.description}"?`;

    if (window.confirm(confirmMessage)) {
      try {
        await deleteExpense(expense.id);
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const openEditForm = (expense: SharedExpense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingExpense(null);
  };

  const getBalanceColor = () => {
    if (balance.whoOwes === 'balanced') return 'text-green-600';
    return 'text-orange-600';
  };

  const getBalanceIcon = () => {
    if (balance.whoOwes === 'balanced') return DollarSign;
    return balance.netBalance > 0 ? TrendingUp : TrendingDown;
  };

  const formatExpenseTitle = (expense: SharedExpense) => {
    if (expense.hasInstallments && expense.installmentNumber) {
      return `${expense.description} (Cuota ${expense.installmentNumber}/${expense.installmentsTotal})`;
    }
    return expense.description;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gastos Compartidos del Hogar
              </h1>
            </div>
            
            <button
              onClick={() => setIsFormOpen(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Gasto</span>
            </button>
          </div>

          {/* Navegación por mes */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-semibold text-gray-800 min-w-[200px] text-center capitalize">
              {formatMonth(currentMonth)}
            </h2>
            
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Resumen de Balances */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Gastos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(balance.totalExpenses)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Felipe pagó</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(balance.felipePaid)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Camila pagó</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(balance.camilaPaid)}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Balance</p>
                <p className={`text-2xl font-bold ${getBalanceColor()}`}>
                  {balance.whoOwes === 'balanced' 
                    ? 'Equilibrado' 
                    : `${balance.whoOwes} debe ${formatCurrency(balance.amountOwed)}`
                  }
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                balance.whoOwes === 'balanced' ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                {React.createElement(getBalanceIcon(), { 
                  className: `w-6 h-6 ${getBalanceColor().replace('text-', 'text-')}`
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Gastos */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Gastos del Mes ({expenses.length})
            </h3>
          </div>

          {expenses.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No hay gastos registrados para este mes</p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="btn-primary"
              >
                Agregar Primer Gasto
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {expenses.map((expense) => (
                <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">
                          {formatExpenseTitle(expense)}
                        </h4>
                        {expense.isShared && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Compartido {expense.sharedPercentage}%
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{expense.date.toLocaleDateString('es-ES')}</span>
                        <span className={`font-medium ${
                          expense.paidBy === 'Felipe' ? 'text-blue-600' : 'text-purple-600'
                        }`}>
                          Pagado por {expense.paidBy}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(expense.amount)}
                        </p>
                        {expense.isShared && (
                          <p className="text-xs text-gray-500">
                            Felipe: {formatCurrency(Math.round(expense.amount * ((100 - expense.sharedPercentage) / 100)))} | 
                            Camila: {formatCurrency(Math.round(expense.amount * (expense.sharedPercentage / 100)))}
                          </p>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditForm(expense)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulario Modal */}
        <SharedExpenseForm
          isOpen={isFormOpen}
          onClose={closeForm}
          onSubmit={editingExpense ? handleEditExpense : handleAddExpense}
          editingExpense={editingExpense || undefined}
        />
      </div>
    </div>
  );
};

export default SharedExpenses; 