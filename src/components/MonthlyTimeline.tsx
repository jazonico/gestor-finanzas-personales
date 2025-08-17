import React, { useMemo } from 'react';
import { Calendar, Clock, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
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
  day: number;
}

const MonthlyTimeline: React.FC = () => {
  const { transactions, recurringPayments, currentMonth } = useFinancialContext();
  const today = new Date();
  const currentDay = today.getDate();
  const isCurrentMonth = 
    today.getFullYear() === currentMonth.getFullYear() && 
    today.getMonth() === currentMonth.getMonth();

  // Obtener el número de días del mes actual
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

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
          day: dayOfMonth,
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
          day: payment.dayOfMonth,
        });
      });

    // Ordenar eventos por fecha
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [transactions, recurringPayments, currentMonth, currentDay, isCurrentMonth, today]);

  const formatMonth = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  // Agrupar eventos por día
  const eventsByDay = useMemo(() => {
    const grouped: { [key: number]: TimelineEvent[] } = {};
    timelineEvents.forEach(event => {
      if (!grouped[event.day]) {
        grouped[event.day] = [];
      }
      grouped[event.day].push(event);
    });
    return grouped;
  }, [timelineEvents]);

  // Calcular posición en la línea de tiempo (0-100%)
  const getPositionPercentage = (day: number) => {
    return ((day - 1) / (daysInMonth - 1)) * 100;
  };

  const getCurrentDayPosition = () => {
    if (!isCurrentMonth) return 0;
    return getPositionPercentage(currentDay);
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

      {/* Línea de tiempo gráfica */}
      <div className="relative mb-8">
        {/* Línea base */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
        
        {/* Línea de progreso (solo si es el mes actual) */}
        {isCurrentMonth && (
          <div 
            className="absolute top-6 left-0 h-1 bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${getCurrentDayPosition()}%` }}
          ></div>
        )}

        {/* Marcadores de inicio y fin del mes */}
        <div className="relative flex justify-between items-center h-12">
          {/* Día 1 */}
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 bg-gray-300 rounded-full border-2 border-white shadow-sm"></div>
            <span className="text-xs text-gray-500 mt-2">1</span>
          </div>

          {/* Día actual (si es el mes actual) */}
          {isCurrentMonth && (
            <div 
              className="absolute flex flex-col items-center transform -translate-x-1/2"
              style={{ left: `${getCurrentDayPosition()}%` }}
            >
              <div className="w-5 h-5 bg-orange-500 rounded-full border-3 border-white shadow-lg animate-pulse"></div>
              <span className="text-xs text-orange-600 font-medium mt-2">Hoy</span>
            </div>
          )}

          {/* Último día */}
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 bg-gray-300 rounded-full border-2 border-white shadow-sm"></div>
            <span className="text-xs text-gray-500 mt-2">{daysInMonth}</span>
          </div>
        </div>

        {/* Eventos en la línea de tiempo */}
        {Object.entries(eventsByDay).map(([day, dayEvents]) => {
          const dayNum = parseInt(day);
          const position = getPositionPercentage(dayNum);
          const primaryEvent = dayEvents[0]; // Evento principal para mostrar
          const hasMultipleEvents = dayEvents.length > 1;

          return (
            <div
              key={day}
              className="absolute flex flex-col items-center transform -translate-x-1/2 group"
              style={{ left: `${position}%`, top: '-20px' }}
            >
              {/* Punto del evento */}
              <div className={`relative w-6 h-6 rounded-full border-3 border-white shadow-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110 ${
                primaryEvent.status === 'completed' ? 'bg-green-500' :
                primaryEvent.status === 'today' ? 'bg-orange-500' : 'bg-blue-400'
              }`}>
                <primaryEvent.icon className="w-3 h-3 text-white" />
                
                {/* Indicador de múltiples eventos */}
                {hasMultipleEvents && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border border-white text-xs flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{dayEvents.length}</span>
                  </div>
                )}
              </div>

              {/* Tooltip con información del evento */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 min-w-64">
                <div className="text-center">
                  <p className="font-semibold text-sm mb-1">{dayNum} de {formatMonth(currentMonth).split(' ')[0]}</p>
                  {dayEvents.map((event, index) => (
                    <div key={event.id} className={`${index > 0 ? 'mt-2 pt-2 border-t border-gray-600' : ''}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{event.title}</span>
                        {event.amount && (
                          <span className={`text-sm font-bold ${
                            event.type === 'income' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {event.type === 'income' ? '+' : '-'}{formatCurrency(event.amount)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-300">{event.description}</p>
                      {event.status === 'upcoming' && isCurrentMonth && (
                        <p className="text-xs text-blue-300 mt-1">
                          Faltan {dayNum - currentDay} días
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {/* Flecha del tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-800"></div>
              </div>

              {/* Etiqueta del día */}
              <span className="text-xs text-gray-600 mt-2 font-medium">{dayNum}</span>
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-center space-x-6 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-600">Completado</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="text-xs text-gray-600">Hoy</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          <span className="text-xs text-gray-600">Próximo</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span className="text-xs text-gray-600">Múltiples eventos</span>
        </div>
      </div>

      {/* Resumen */}
      <div className="pt-4 border-t border-gray-200">
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
            <p className="text-lg font-semibold text-blue-600">
              {timelineEvents.filter(e => e.status === 'upcoming').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyTimeline; 