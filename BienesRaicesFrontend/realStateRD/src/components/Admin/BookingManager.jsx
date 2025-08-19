import React, { useState, useEffect } from 'react';
import { adminService } from './adminService';

const BookingManager = () => {
  const [bookings, setBookings] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadBookingData();
  }, []);

  useEffect(() => {
    if (activeTab === 'slots') {
      loadAvailableSlots();
    }
  }, [activeTab, selectedDate]);

  const loadBookingData = async () => {
    setIsLoading(true);
    try {
      console.log('Loading booking data...');
      const result = await adminService.getAllBookings();
      console.log('Booking API result:', result);
      
      if (result.success) {
        // Ensure bookings is always an array
        const bookingsData = result.data?.data || result.data || [];
        console.log('Raw bookings data:', bookingsData);
        console.log('Is array?', Array.isArray(bookingsData));
        console.log('Length:', bookingsData.length);
        
        const finalBookings = Array.isArray(bookingsData) ? bookingsData : [];
        console.log('Final bookings to set:', finalBookings);
        setBookings(finalBookings);
      } else {
        console.log('API call failed:', result.error);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    setIsLoading(true);
    try {
      const startDate = selectedDate;
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 7); // Load next 7 days
      
      const result = await adminService.getAvailableSlots(startDate, endDate.toISOString().split('T')[0]);
      if (result.success) {
        setAvailableSlots(result.data || []);
      }
    } catch (error) {
      console.error('Error loading available slots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      const result = await adminService.cancelBooking(bookingId);
      if (result.success) {
        await loadBookingData(); // Reload data after cancellation
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    // Handle numeric enum values from backend
    const statusStr = typeof status === 'number' ? getStatusText(status) : String(status || '');
    
    switch (statusStr.toLowerCase()) {
      case 'confirmed':
      case 'confirmada':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled':
      case 'cancelada':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'pending':
      case 'pendiente':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusText = (status) => {
    // Handle numeric enum values: 0=Pending, 1=Confirmed, 2=Cancelled
    if (typeof status === 'number') {
      switch (status) {
        case 0: return 'Pendiente';
        case 1: return 'Confirmada';
        case 2: return 'Cancelada';
        default: return 'Desconocido';
      }
    }
    return String(status || 'Desconocido');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Gestión de Reservas
                </h1>
                <p className="text-slate-600 mt-2 text-lg">
                  Administra todas las reservas y horarios disponibles del sistema
                </p>
              </div>
              
              {/* Modern Tab Navigation */}
              <div className="flex bg-slate-100/80 rounded-xl p-1.5 backdrop-blur-sm">
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    activeTab === 'bookings'
                      ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-500/25 transform scale-105'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  Reservas Activas
                </button>
                <button
                  onClick={() => setActiveTab('slots')}
                  className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    activeTab === 'slots'
                      ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-500/25 transform scale-105'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  Horarios Disponibles
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Date Filter for Slots */}
        {activeTab === 'slots' && (
          <div className="mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Seleccionar Fecha
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                {activeTab === 'bookings' ? 'Todas las Reservas' : 'Horarios Disponibles'}
              </h2>
              {!isLoading && (
                <div className="text-sm text-slate-500">
                  {activeTab === 'bookings' 
                    ? `${bookings.length} reservas encontradas`
                    : `${availableSlots.length} horarios disponibles`
                  }
                </div>
              )}
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200"></div>
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent absolute top-0"></div>
                </div>
              </div>
            ) : activeTab === 'bookings' ? (
              // Bookings View
              bookings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-500 text-lg">No hay reservas registradas</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Fecha de Cita
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Horario
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-4">
                                {(booking.user?.username?.[0] || booking.user?.email?.[0] || 'U').toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-900">
                                  {booking.user?.username || 'Usuario desconocido'}
                                </div>
                                <div className="text-sm text-slate-500">
                                  {booking.user?.email || 'Email no disponible'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">
                              {booking.timeSlot?.slotDate ? formatDate(booking.timeSlot.slotDate) : 'Fecha no disponible'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900 font-mono">
                              {booking.timeSlot?.startTime && booking.timeSlot?.endTime 
                                ? `${formatTime(booking.timeSlot.startTime)} - ${formatTime(booking.timeSlot.endTime)}`
                                : 'Hora no disponible'
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(booking.status)}`}>
                              {getStatusText(booking.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {(typeof booking.status === 'number' ? booking.status !== 2 : booking.status?.toLowerCase() !== 'cancelled') && (
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                className="bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 px-4 py-2 rounded-lg transition-all duration-200 font-medium border border-rose-200 hover:border-rose-300"
                              >
                                Cancelar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              // Available Slots View
              availableSlots.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-500 text-lg">No hay horarios disponibles para la fecha seleccionada</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableSlots.map((slot) => (
                    <div key={slot.id} className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-indigo-300 transition-all duration-300 group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm font-semibold text-slate-900">
                          {slot.slotDate ? formatDate(slot.slotDate) : 'Fecha no disponible'}
                        </div>
                        <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                          ID: {slot.id}
                        </div>
                      </div>
                      <div className="text-xl font-bold text-indigo-600 mb-4 font-mono group-hover:text-indigo-700 transition-colors">
                        {slot.startTime && slot.endTime 
                          ? `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`
                          : 'Hora no disponible'
                        }
                      </div>
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex justify-between">
                          <span>Capacidad máxima:</span>
                          <span className="font-semibold">{slot.maxCapacity || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reservas actuales:</span>
                          <span className="font-semibold text-indigo-600">{slot.currentBookings || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Disponibles:</span>
                          <span className="font-semibold text-emerald-600">{slot.availableSlots || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Reservas</p>
                <p className="text-3xl font-bold mt-1">{bookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-400/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Confirmadas</p>
                <p className="text-3xl font-bold mt-1">
                  {bookings.filter(b => typeof b.status === 'number' ? b.status === 1 : b.status?.toLowerCase() === 'confirmed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-400/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Horarios Disponibles</p>
                <p className="text-3xl font-bold mt-1">{availableSlots.length}</p>
              </div>
              <div className="w-12 h-12 bg-amber-400/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingManager;
