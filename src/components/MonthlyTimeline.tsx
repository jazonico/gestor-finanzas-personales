import React, { useMemo } from 'react';
import { Calendar, Clock, CreditCard, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import { useFinancialContext } from '../context/FinancialContext';

interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
  amount?: number;
  type: 'income' | 'expense' | 'recurring' | 'shared';
  status: 'completed' | 'upcoming' | 'today';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const MonthlyTimeline: React.FC = () => {
  const { transactions, recurringPayments, currentMonth } = useFinancialContext();
  const today = new Date();
  const currentDay = today.getDate();
  const isCurrentMonth = 
    today.getFullYear() === currentMonth.getFullYear() && 
    today.getMonth() === currentMonth.getMonth();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];

    // Agregar transacciones del mes actual
    transactions.forEach(transaction => {
      if (
        transaction.date.getFullYear() === currentMonth.getFullYear() &&
        transaction.date.getMonth() === currentMonth.getMonth()
      ) {
        const dayOfMonth = transaction.date.getDate();
        let status: 'completed' | 'upcoming' | 'today' = 'completed';
        
        if (isCurrentMonth) {
          if (dayOfMonth === currentDay) status = 'today';
          else if (dayOfMonth > currentDay) status = 'upcoming';
        }

        events.push({
          id: `transaction-${transaction.id}`,
          date: transaction.date,
          title: transaction.description,
          description: transaction.category,
          amount: transaction.amount,
          type: transaction.type,
          status,
          icon: transaction.type === 'income' ? TrendingUp : TrendingDown,
          color: transaction.type === 'income' ? 'text-green-600' : 'text-red-600',
        });
      }
    });

    // Agregar pagos recurrentes activos
    recurringPayments
      .filter(payment => payment.isActive)
      .forEach(payment => {
        const eventDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), payment.dayOfMonth);
        let status: 'completed' | 'upcoming' | 'today' = 'upcoming';
        
        if (isCurrentMonth) {
          if (payment.dayOfMonth === currentDay) status = 'today';
          else if (payment.dayOfMonth < currentDay) status = 'completed';
        } else if (currentMonth < today) {
          status = 'completed';
        }

        events.push({
          id: `recurring-${payment.id}`,
          date: eventDate,
          title: payment.name,
          description: `${payment.category} - Pago recurrente`,
          amount: payment.amount,
          type: payment.type,
          status,
          icon: payment.type === 'income' ? TrendingUp : CreditCard,
          color: payment.type === 'income' ? 'text-green-600' : 'text-blue-600',
        });
      });

    // Ordenar eventos por fecha
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [transactions, recurringPayments, currentMonth, currentDay, isCurrentMonth, today]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'today':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'today':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatMonth = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  if (timelineEvents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Línea de Tiempo - {formatMonth(currentMonth)}
          </h3>
        </div>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay eventos financieros programados para este mes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Línea de Tiempo - {formatMonth(currentMonth)}
          </h3>
        </div>
        {isCurrentMonth && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Hoy: {currentDay} de {formatMonth(currentMonth).split(' ')[0]}</span>
          </div>
        )}
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {timelineEvents.map((event, index) => (
          <div key={event.id} className="flex items-start space-x-4">
            {/* Línea vertical */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getStatusBg(event.status)}`}>
                {getStatusIcon(event.status)}
              </div>
              {index < timelineEvents.length - 1 && (
                <div className="w-px h-12 bg-gray-200 mt-2"></div>
              )}
            </div>

            {/* Contenido del evento */}
            <div className={`flex-1 p-4 rounded-lg border ${getStatusBg(event.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <event.icon className={`w-4 h-4 ${event.color}`} />
                  <span className="text-sm font-medium text-gray-900">
                    {event.date.getDate()} de {formatMonth(event.date).split(' ')[0]}
                  </span>
                  {event.status === 'today' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Hoy
                    </span>
                  )}
                </div>
                {event.amount && (
                  <span className={`font-semibold ${event.color}`}>
                    {event.type === 'income' ? '+' : '-'}{formatCurrency(event.amount)}
                  </span>
                )}
              </div>
              
              <h4 className="font-medium text-gray-900 mb-1">{event.title}</h4>
              <p className="text-sm text-gray-600">{event.description}</p>
              
              {event.status === 'upcoming' && isCurrentMonth && (
                <p className="text-xs text-gray-500 mt-2">
                  Faltan {event.date.getDate() - currentDay} días
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Resumen */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Completados</p>
            <p className="text-lg font-semibold text-green-600">
              {timelineEvents.filter(e => e.status === 'completed').length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Hoy</p>
            <p className="text-lg font-semibold text-orange-600">
              {timelineEvents.filter(e => e.status === 'today').length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Próximos</p>
            <p className="text-lg font-semibold text-gray-600">
              {timelineEvents.filter(e => e.status === 'upcoming').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyTimeline; 