import React, { useState } from 'react';
import { Transaction } from '../types';
import { dateUtils } from '../utils/dateUtils';
import { getCategoryIcon, getCategoryColor } from '../utils/categories';
import { Edit2, Trash2, Search } from 'lucide-react';
import { useFinancialContext } from '../context/FinancialContext';

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const { deleteTransaction } = useFinancialContext();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtrar y ordenar transacciones
  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesFilter = filter === 'all' || transaction.type === filter;
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.date.getTime() - b.date.getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      deleteTransaction(id);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay transacciones registradas este mes</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controles de filtro y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar transacciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'income' | 'expense')}
            className="input-field w-auto"
          >
            <option value="all">Todas</option>
            <option value="income">Ingresos</option>
            <option value="expense">Gastos</option>
          </select>
          
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy as 'date' | 'amount' | 'category');
              setSortOrder(newSortOrder as 'asc' | 'desc');
            }}
            className="input-field w-auto"
          >
            <option value="date-desc">Fecha (más reciente)</option>
            <option value="date-asc">Fecha (más antigua)</option>
            <option value="amount-desc">Monto (mayor)</option>
            <option value="amount-asc">Monto (menor)</option>
            <option value="category-asc">Categoría (A-Z)</option>
            <option value="category-desc">Categoría (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Lista de transacciones */}
      <div className="space-y-2">
        {filteredTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                style={{ backgroundColor: getCategoryColor(transaction.category, transaction.type) }}
              >
                {getCategoryIcon(transaction.category, transaction.type)}
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">
                  {transaction.description}
                  {transaction.isRecurring && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Recurrente
                    </span>
                  )}
                </h4>
                <p className="text-sm text-gray-500">
                  {transaction.category} • {dateUtils.formatDate(transaction.date)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {/* TODO: Implementar edición */}}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(transaction.id)}
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

      {filteredTransactions.length === 0 && (searchTerm || filter !== 'all') && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No se encontraron transacciones que coincidan con los filtros aplicados
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionList; 