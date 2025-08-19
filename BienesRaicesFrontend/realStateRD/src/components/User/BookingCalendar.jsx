import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { toast } from 'react-toastify';

const BookingCalendar = ({ onBookingSuccess }) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateRange, setDateRange] = useState(7);
  const [viewMode, setViewMode] = useState('week');

  useEffect(() => {
    loadAvailableSlots();
  }, [selectedDate, dateRange]);

  const loadAvailableSlots = async () => {
    try {
      setLoading(true);
      const startDate = selectedDate;
      const endDate = new Date(new Date(selectedDate).getTime() + dateRange * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Validate date range
      const validation = userService.validateDateRange(startDate, endDate);
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }

      const result = await userService.getAvailableSlots(startDate, endDate);
      if (result.success) {
        setAvailableSlots(result.data);
      } else {
        toast.error(result.error || 'Error al cargar horarios disponibles');
      }
    } catch (error) {
      console.error('Error loading available slots:', error);
      toast.error('Error al cargar horarios disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = async (slotId, slotData) => {
    if (bookingLoading) return;
    
    // Validate booking data
    const validation = userService.validateBookingData(slotId);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    // Check if slot time has passed
    if (userService.isSlotPastTime(slotData)) {
      toast.error('No puedes reservar un horario que ya ha pasado');
      return;
    }
    
    try {
      setBookingLoading(true);
      const result = await userService.createBooking(slotId, slotData);
      
      if (result.success) {
        toast.success(result.message);
        loadAvailableSlots();
        if (onBookingSuccess) {
          onBookingSuccess();
        }
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Error al crear la reserva');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setDateRange(mode === 'week' ? 7 : 30);
  };

  const groupedSlots = userService.groupSlotsByDate(availableSlots);

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Calendario de Reservas
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Fecha:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'week'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => handleViewModeChange('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'month'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mes
            </button>
          </div>
          
          <button
            onClick={loadAvailableSlots}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Actualizar
          </button>
        </div>
      </div>

      {/* Availability Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">Disponibilidad:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-600">Alta (75%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-sm text-gray-600">Media (50-75%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-sm text-gray-600">Baja (25-50%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-sm text-gray-600">Lleno (0%)</span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="text-gray-700 font-medium">Cargando horarios disponibles...</span>
          </div>
        </div>
      )}

      {/* Available Slots by Date */}
      {!loading && (
        <div className="space-y-6 max-h-96 overflow-y-auto">
          {Object.keys(groupedSlots).length > 0 ? (
            Object.entries(groupedSlots).map(([date, slots]) => (
              <div key={date} className="border-b border-gray-200 pb-6 last:border-b-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {userService.formatDate(date)}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {slots.map((slot) => {
                    const isSlotPast = userService.isSlotPastTime(slot);
                    const isSlotFull = userService.isSlotFull(slot);
                    const canBook = userService.canBookSlot(slot);
                    
                    return (
                      <div
                        key={slot.id}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                          isSlotPast
                            ? 'bg-gray-100 border-gray-300 opacity-50'
                            : isSlotFull
                            ? 'bg-red-50 border-red-200 opacity-60'
                            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-indigo-300 hover:shadow-lg cursor-pointer transform hover:scale-105'
                        }`}
                      >
                        {/* Past Time Indicator */}
                        {isSlotPast && (
                          <div className="absolute top-2 left-2">
                            <div className="flex items-center text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Pasado
                            </div>
                          </div>
                        )}
                        
                        {/* Availability Indicator */}
                        <div className="absolute top-2 right-2">
                          <div className={`w-3 h-3 rounded-full ${
                            isSlotPast 
                              ? 'bg-gray-400' 
                              : userService.getAvailabilityColor(slot.availableSlots, slot.maxCapacity)
                          }`}></div>
                        </div>
                        
                        {/* Time Display */}
                        <div className="mb-3">
                          <p className={`text-lg font-bold ${isSlotPast ? 'text-gray-500' : 'text-gray-900'}`}>
                            {userService.formatTime(slot.startTime)} - {userService.formatTime(slot.endTime)}
                          </p>
                          <p className={`text-sm font-medium ${
                            isSlotPast 
                              ? 'text-gray-400' 
                              : isSlotFull 
                              ? 'text-red-600' 
                              : 'text-green-600'
                          }`}>
                            {isSlotPast 
                              ? 'Horario pasado' 
                              : `${slot.availableSlots} de ${slot.maxCapacity} disponibles`
                            }
                          </p>
                        </div>

                        {/* Capacity Bar */}
                        <div className="mb-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                isSlotPast 
                                  ? 'bg-gray-400' 
                                  : userService.getAvailabilityColor(slot.availableSlots, slot.maxCapacity)
                              }`}
                              style={{
                                width: `${((slot.maxCapacity - slot.availableSlots) / slot.maxCapacity) * 100}%`
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {isSlotPast 
                              ? 'No disponible' 
                              : `${Math.round(((slot.maxCapacity - slot.availableSlots) / slot.maxCapacity) * 100)}% ocupado`
                            }
                          </p>
                        </div>
                        
                        {/* Book Button */}
                        <button
                          onClick={() => handleBookSlot(slot.id, slot)}
                          disabled={bookingLoading || !canBook}
                          className={`w-full py-2 px-4 text-sm font-semibold rounded-lg shadow-md transition-all duration-200 ${
                            !canBook
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
                          }`}
                        >
                          {bookingLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Reservando...</span>
                            </div>
                          ) : isSlotPast ? (
                            <div className="flex items-center justify-center space-x-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Horario Pasado</span>
                            </div>
                          ) : isSlotFull ? (
                            <div className="flex items-center justify-center space-x-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span>Lleno</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center space-x-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              <span>Reservar Ahora</span>
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 font-medium text-lg mb-2">No hay horarios disponibles</p>
                <p className="text-gray-400 text-sm mb-4">Selecciona otra fecha o vuelve más tarde</p>
                <button
                  onClick={() => {
                    setSelectedDate(new Date().toISOString().split('T')[0]);
                    setViewMode('week');
                    setDateRange(7);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Ver Esta Semana
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setSelectedDate(new Date().toISOString().split('T')[0]);
              setViewMode('week');
              setDateRange(7);
            }}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Esta Semana
          </button>
          
          <button
            onClick={() => {
              const nextWeek = new Date();
              nextWeek.setDate(nextWeek.getDate() + 7);
              setSelectedDate(nextWeek.toISOString().split('T')[0]);
              setViewMode('week');
              setDateRange(7);
            }}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Próxima Semana
          </button>
          
          <button
            onClick={() => {
              const nextMonth = new Date();
              nextMonth.setMonth(nextMonth.getMonth() + 1);
              setSelectedDate(nextMonth.toISOString().split('T')[0]);
              setViewMode('month');
              setDateRange(30);
            }}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Próximo Mes
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
