import React, { useState, useEffect } from 'react';
import { adminService } from './adminService';

const DashboardStats = ({ onNavigateToTab }) => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    availableSlots: 0,
    recentActivities: [],
    systemStatus: {
      api: 'checking',
      database: 'checking'
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load all bookings for admin dashboard
      const bookingsResult = await adminService.getAllBookings();
      
      // Load available slots
      const slotsResult = await adminService.getAvailableSlots();
      
      // Load system health
      const healthResult = await adminService.getSystemHealth();

      if (bookingsResult.success) {
        const bookings = bookingsResult.data?.data || bookingsResult.data || [];
        const totalBookings = bookings.length;
        const confirmedBookings = bookings.filter(b => typeof b.status === 'number' ? b.status === 1 : b.status?.toLowerCase() === 'confirmed').length;
        const pendingBookings = bookings.filter(b => typeof b.status === 'number' ? b.status === 0 : b.status?.toLowerCase() === 'pending').length;
        
        setStats(prevStats => ({
          ...prevStats,
          totalBookings,
          confirmedBookings,
          pendingBookings,
          recentActivities: bookings.slice(0, 5).map(booking => ({
            id: booking.id,
            type: 'booking',
            description: `Reserva de ${booking.user?.username || 'Usuario'} para ${booking.timeSlot?.slotDate ? new Date(booking.timeSlot.slotDate).toLocaleDateString() : 'fecha no disponible'}`,
            time: new Date(booking.bookingDate).toLocaleString(),
            status: booking.status
          }))
        }));
      }

      if (slotsResult.success) {
        setStats(prevStats => ({
          ...prevStats,
          availableSlots: slotsResult.data?.length || 0
        }));
      }

      if (healthResult.success) {
        setStats(prevStats => ({
          ...prevStats,
          systemStatus: {
            api: 'online',
            database: 'connected'
          }
        }));
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setStats(prevStats => ({
        ...prevStats,
        systemStatus: {
          api: 'offline',
          database: 'disconnected'
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleQuickAction = (action) => {
    if (onNavigateToTab) {
      switch (action) {
        case 'config':
          onNavigateToTab('config');
          break;
        case 'bookings':
          onNavigateToTab('bookings');
          break;
        case 'reports':
          onNavigateToTab('bookings');
          break;
        default:
          break;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Panel de Administración</h1>
                <p className="text-indigo-100 mt-2 text-lg">
                  Gestiona las reservas y configuraciones de RealStateRD
                </p>
                <p className="text-indigo-200 text-sm mt-1">
                  Última actualización: {lastUpdated.toLocaleString()}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition duration-200 flex items-center space-x-2 backdrop-blur-sm disabled:opacity-50"
              >
                <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Actualizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Reservas</p>
                <p className="text-3xl font-bold mt-1">{isLoading ? '...' : stats.totalBookings}</p>
                <p className="text-blue-200 text-sm mt-1">Todas las reservas del sistema</p>
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
                <p className="text-emerald-100 text-sm font-medium">Reservas Confirmadas</p>
                <p className="text-3xl font-bold mt-1">{isLoading ? '...' : stats.confirmedBookings}</p>
                <p className="text-emerald-200 text-sm mt-1">Citas programadas</p>
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
                <p className="text-3xl font-bold mt-1">{isLoading ? '...' : stats.availableSlots}</p>
                <p className="text-amber-200 text-sm mt-1">Slots libres para reservar</p>
              </div>
              <div className="w-12 h-12 bg-amber-400/30 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Acciones Rápidas</h3>
            <div className="space-y-4">
              <button 
                onClick={() => handleQuickAction('config')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 rounded-xl transition-all duration-200 group border border-indigo-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-slate-900 block">Nueva Configuración</span>
                    <span className="text-sm text-slate-600">Crear horarios y turnos</span>
                  </div>
                </div>
                <svg className="w-5 h-5 text-indigo-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button 
                onClick={() => handleQuickAction('bookings')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 rounded-xl transition-all duration-200 group border border-emerald-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-slate-900 block">Gestionar Reservas</span>
                    <span className="text-sm text-slate-600">Ver y administrar citas</span>
                  </div>
                </div>
                <svg className="w-5 h-5 text-emerald-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button 
                onClick={() => handleQuickAction('reports')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-200 group border border-purple-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-slate-900 block">Ver Reportes</span>
                    <span className="text-sm text-slate-600">Estadísticas y análisis</span>
                  </div>
                </div>
                <svg className="w-5 h-5 text-purple-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Actividad Reciente</h3>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
                </div>
              ) : stats.recentActivities.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>No hay actividad reciente</p>
                </div>
              ) : (
                stats.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 hover:bg-slate-50/50 rounded-lg transition duration-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {activity.description}
                      </p>
                      <p className="text-sm text-slate-500">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {stats.recentActivities.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200">
                <button 
                  onClick={() => handleQuickAction('bookings')}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  Ver todas las reservas →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Estado del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 ${stats.systemStatus.api === 'online' ? 'bg-emerald-500' : 'bg-rose-500'} rounded-full`}></div>
                <span className="text-sm text-slate-600">API Backend</span>
                <span className={`text-sm font-medium ${stats.systemStatus.api === 'online' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stats.systemStatus.api === 'online' ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 ${stats.systemStatus.database === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'} rounded-full`}></div>
                <span className="text-sm text-slate-600">Base de Datos</span>
                <span className={`text-sm font-medium ${stats.systemStatus.database === 'connected' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stats.systemStatus.database === 'connected' ? 'Conectada' : 'Desconectada'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm text-slate-600">Sistema</span>
                <span className="text-sm font-medium text-emerald-600">Operativo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
