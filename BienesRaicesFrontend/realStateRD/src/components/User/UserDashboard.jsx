import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { toast } from 'react-toastify';

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateRange, setDateRange] = useState(7); // days to show
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  const { user, logout } = useAuth();

  useEffect(() => {
    loadDashboardData();
    loadAvailableSlots();
  }, [selectedDate, dateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const result = await userService.getDashboard();
      if (result.success) {
        setDashboardData(result.data);
      } else {
        toast.error(result.error || 'Error al cargar el dashboard');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
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
    }
  };

  const handleQuickBook = async (slotId) => {
    if (bookingLoading) return;
    
    // Validate booking data
    const validation = userService.validateBookingData(slotId);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }
    
    try {
      setBookingLoading(true);
      const result = await userService.createBooking(slotId);
      
      if (result.success) {
        toast.success(result.message);
        loadDashboardData();
        loadAvailableSlots();
        setSelectedSlot(null);
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

  const handleCancelBooking = async (bookingId) => {
    if (!bookingId) return;
    
    const confirmCancel = window.confirm('¿Estás seguro de que quieres cancelar esta reserva?');
    if (!confirmCancel) return;

    try {
      const result = await userService.cancelBooking(bookingId);
      if (result.success) {
        toast.success(result.message);
        loadDashboardData();
        loadAvailableSlots();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
      toast.error('Error al cancelar la reserva');
    }
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setDateRange(mode === 'week' ? 7 : 30);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="bg-slate-900/80 rounded-xl border border-slate-900 p-6 flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-600 border-t-transparent" aria-label="Cargando"></div>
          <span className="text-slate-300 text-sm">Cargando tu dashboard...</span>
        </div>
      </div>
    );
  }

  const groupedSlots = userService.groupSlotsByDate(availableSlots);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      {/* Header */}
      <header className="sticky top-0 z-30 h-16 bg-slate-950/90 backdrop-blur border-b border-slate-900">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-100">Mi Panel</h1>
            <p className="text-xs text-slate-500">Gestiona tus reservas</p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="px-3 py-1 rounded-md border border-slate-900 bg-slate-950/60 text-sm text-slate-400">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center px-3 py-2 rounded-md bg-red-950/60 hover:bg-red-900/70 border border-red-900 text-red-100 outline-none focus-visible:ring-2 focus-visible:ring-red-800 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="rounded-xl border border-slate-900 bg-slate-950/60 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Total de Reservas</p>
                <p className="text-xl font-semibold text-slate-100">{dashboardData?.myBookings?.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-900 bg-slate-950/60 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Confirmadas</p>
                <p className="text-xl font-semibold text-slate-100">{dashboardData?.myBookings?.confirmed || 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-900 bg-slate-950/60 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Slots Disponibles</p>
                <p className="text-xl font-semibold text-slate-100">{availableSlots.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Date and View Controls */}
        <div className="rounded-xl border border-slate-900 bg-slate-950/60 p-5 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-base font-semibold text-slate-100 flex items-center">
              <svg className="w-4 h-4 mr-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Reservar Cita
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-300">Fecha:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="px-3 py-2 border border-slate-900 bg-slate-950 text-slate-300 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-slate-600"
                />
              </div>
              
              <div className="flex bg-slate-950 rounded-md p-1 border border-slate-900">
                <button
                  onClick={() => handleViewModeChange('week')}
                  aria-pressed={viewMode === 'week'}
                  className={`px-3 py-1.5 rounded text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-slate-600 ${
                    viewMode === 'week' ? 'bg-slate-900 text-slate-100' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Semana
                </button>
                <button
                  onClick={() => handleViewModeChange('month')}
                  aria-pressed={viewMode === 'month'}
                  className={`px-3 py-1.5 rounded text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-slate-600 ${
                    viewMode === 'month' ? 'bg-slate-900 text-slate-100' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Mes
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Slots by Date */}
          <div className="rounded-xl border border-slate-900 bg-slate-950/60 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-100 flex items-center">
                <svg className="w-4 h-4 mr-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Horarios Disponibles
              </h2>
            </div>

            <div className="space-y-5 max-h-96 overflow-y-auto pr-1">
              {Object.keys(groupedSlots).length > 0 ? (
                Object.entries(groupedSlots).map(([date, slots]) => (
                  <div key={date} className="border-b border-slate-900 pb-4 last:border-b-0">
                    <h3 className="text-sm font-semibold text-slate-100 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {userService.formatDate(date)}
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {slots.map((slot) => (
                        <div
                          key={slot.id}
                          className={`p-4 rounded-lg border transition-colors ${
                            userService.isSlotFull(slot)
                              ? 'bg-slate-900 border-slate-900 opacity-60'
                              : 'bg-slate-950/60 border-slate-900 hover:bg-slate-950'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-2.5 h-2.5 rounded-full ${userService.getAvailabilityColor(slot.availableSlots, slot.maxCapacity)}`}></div>
                              <div className="min-w-0">
                                <p className="font-medium text-slate-100 truncate">
                                  {userService.formatTime(slot.startTime)} - {userService.formatTime(slot.endTime)}
                                </p>
                                <p className={`text-[11px] font-medium ${
                                  userService.isSlotFull(slot) ? 'text-red-400' : 'text-emerald-400'
                                }`}>
                                  {slot.availableSlots} de {slot.maxCapacity} disponibles
                                </p>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleQuickBook(slot.id)}
                              disabled={bookingLoading || userService.isSlotFull(slot)}
                              className={`px-3 py-1.5 text-xs font-medium rounded-md outline-none focus-visible:ring-2 focus-visible:ring-slate-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                                userService.isSlotFull(slot)
                                  ? 'bg-slate-900 text-slate-400 cursor-not-allowed'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-100'
                              }`}
                              aria-disabled={bookingLoading || userService.isSlotFull(slot)}
                              aria-label={`Reservar ${userService.formatTime(slot.startTime)} a ${userService.formatTime(slot.endTime)}`}
                            >
                              {bookingLoading ? (
                                <div className="flex items-center gap-1">
                                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/70 border-t-transparent" aria-hidden="true"></div>
                                  <span>...</span>
                                </div>
                              ) : userService.isSlotFull(slot) ? (
                                'Lleno'
                              ) : (
                                'Reservar'
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-slate-300 text-sm font-medium">No hay horarios disponibles</p>
                  <p className="text-slate-400 text-xs">Selecciona otra fecha o vuelve más tarde</p>
                </div>
              )}
            </div>
          </div>

          {/* My Recent Bookings */}
          <div className="rounded-xl border border-slate-900 bg-slate-950/60 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-100 flex items-center">
                <svg className="w-4 h-4 mr-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                </svg>
                Mis Reservas Recientes
              </h2>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {dashboardData?.myBookings?.recent?.length > 0 ? (
                dashboardData.myBookings.recent.map((booking) => (
                  <div key={booking.id} className="rounded-lg p-4 border border-slate-900 bg-slate-950">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center">
                          <span className="text-slate-200 text-xs font-semibold">#{booking.id}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-100 truncate">{userService.formatDate(booking.date)}</p>
                          <p className="text-xs text-slate-500">{userService.formatTime(booking.time)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${userService.getStatusColor(booking.status)}`}>
                          {userService.getStatusText(booking.status)}
                        </span>
                        {booking.status?.toLowerCase() === 'confirmed' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="px-2 py-1 bg-red-950 hover:bg-red-900 text-red-100 border border-red-900 outline-none focus-visible:ring-2 focus-visible:ring-red-800 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  </svg>
                  <p className="text-slate-300 text-sm font-medium">No tienes reservas aún</p>
                  <p className="text-slate-400 text-xs">¡Haz tu primera reserva!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 rounded-xl border border-slate-900 bg-slate-950/60 p-5">
          <h2 className="text-base font-semibold text-slate-100 mb-4 flex items-center">
            <svg className="w-4 h-4 mr-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Acciones Rápidas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={loadDashboardData}
              className="flex items-center justify-center p-3 rounded-md border border-slate-900 bg-slate-950 text-slate-100 text-sm outline-none focus-visible:ring-2 focus-visible:ring-slate-600"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar Reservas
            </button>
            
            <button
              onClick={loadAvailableSlots}
              className="flex items-center justify-center p-3 rounded-md border border-slate-900 bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm outline-none focus-visible:ring-2 focus-visible:ring-slate-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Actualizar Horarios
            </button>
            
            <button
              onClick={() => {
                setSelectedDate(new Date().toISOString().split('T')[0]);
                setViewMode('week');
                setDateRange(7);
              }}
              className="flex items-center justify-center p-3 rounded-md border border-slate-900 bg-slate-950 text-slate-100 text-sm outline-none focus-visible:ring-2 focus-visible:ring-slate-600"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Ver Esta Semana
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
