import axios from 'axios';
import { toast } from 'react-toastify';
import { tokenManager } from '../Auth/authService';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance for admin operations
const adminApi = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
adminApi.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
      // Redirect to login
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      toast.error('No tienes permisos para realizar esta acción.');
    }
    return Promise.reject(error);
  }
);

const toApiConfiguration = (config) => {
  if (!config) return config;
  const toHMS = (t) => (typeof t === 'string' && t.length === 5 ? `${t}:00` : t);
  const toISODateStart = (d) => (d ? `${d}T00:00:00` : d);
  const toISODateEnd = (d) => (d ? `${d}T23:59:59` : d);
  return {
    StartDate: toISODateStart(config.startDate),
    EndDate: toISODateEnd(config.endDate),
    AppointmentDurationMinutes: Number(config.appointmentDurationMinutes),
    Shifts: Array.isArray(config.shifts)
      ? config.shifts.map((s) => ({
        DayOfWeek: Number(s.dayOfWeek),
        Type: Number(s.type),
        StartTime: toHMS(s.startTime), // 'HH:mm:ss'
        EndTime: toHMS(s.endTime),     // 'HH:mm:ss'
        StationCount: Number(s.stationCount),
      }))
      : [],
  };
};

export const adminService = {
  // Configuration management
  async getConfigurations() {
    try {
      const response = await adminApi.get('/configurationsReserve');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching configurations:', error);
      toast.error('Error al cargar configuraciones');
      return { success: false, error: error.message };
    }
  },

  async createConfiguration(configData) {
    try {
      const payload = toApiConfiguration(configData);
      console.log('🛰️ POST /configurationsReserve payload:', payload);
      const response = await adminApi.post('/configurationsReserve', payload);
      toast.success('Configuración creada exitosamente');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating configuration:', error);
      console.error('Server response:', error.response?.data);
      const msg = error.response?.data?.message || error.response?.data?.title || 'Error al crear configuración';
      toast.error(msg);
      return { success: false, error: error.message };
    }
  },

  async updateConfiguration(id, configData) {
    try {
      const payload = toApiConfiguration(configData);
      console.log('🛰️ PUT /configurationsReserve payload:', payload);
      await adminApi.put(`/configurationsReserve/${id}`, payload);
      toast.success('Configuración actualizada exitosamente');
      return { success: true };
    } catch (error) {
      console.error('Error updating configuration:', error);
      console.error('Server response:', error.response?.data);
      const msg = error.response?.data?.message || error.response?.data?.title || 'Error al actualizar configuración';
      toast.error(msg);
      return { success: false, error: error.message };
    }
  },

  async deleteConfiguration(id) {
    try {
      await adminApi.delete(`/configurationsReserve/${id}`);
      toast.success('Configuración eliminada exitosamente');
      return { success: true };
    } catch (error) {
      console.error('Error deleting configuration:', error);
      toast.error('Error al eliminar configuración');
      return { success: false, error: error.message };
    }
  },

  async generateTimeSlots(configId) {
    try {
      await adminApi.post(`/configurationsReserve/${configId}/generate-slots`);
      toast.success('Slots de tiempo generados exitosamente');
      return { success: true };
    } catch (error) {
      console.error('Error generating time slots:', error);
      toast.error('Error al generar slots de tiempo');
      return { success: false, error: error.message };
    }
  },

  // Dashboard statistics
  async getDashboardStats() {
    try {
      const response = await adminApi.get('/bookings/dashboard');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Error al cargar estadísticas del dashboard');
      return { success: false, error: error.message };
    }
  },

  // Booking management
  async getAllBookings() {
    try {
      console.log('🔍 Calling /bookings/all endpoint for admin...');
      // Use the new admin endpoint to get all bookings from the system
      const response = await adminApi.get('/bookings/all');
      console.log('✅ API Response status:', response.status);
      console.log('📊 API Response data:', response.data);
      console.log('📊 Response data type:', typeof response.data);
      console.log('📊 Response data structure:', JSON.stringify(response.data, null, 2));
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error fetching all bookings:', error);
      console.log('🔄 Trying fallback to my-bookings...');
      // Fallback to my-bookings if all endpoint fails
      try {
        const fallbackResponse = await adminApi.get('/bookings/my-bookings');
        console.log('✅ Fallback response:', fallbackResponse.data);
        return { success: true, data: fallbackResponse.data };
      } catch (fallbackError) {
        console.error('💥 Fallback also failed:', fallbackError);
        toast.error('Error al cargar reservas');
        return { success: false, data: [], error: error.message };
      }
    }
  },

  async getAvailableSlots(startDate, endDate) {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await adminApi.get('/bookings/available-slots', { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error('Error al cargar slots disponibles');
      return { success: false, error: error.message };
    }
  },

  async cancelBooking(bookingId) {
    try {
      await adminApi.delete(`/bookings/${bookingId}`);
      toast.success('Reserva cancelada exitosamente');
      return { success: true };
    } catch (error) {
      console.error('Error canceling booking:', error);
      toast.error('Error al cancelar reserva');
      return { success: false, error: error.message };
    }
  },

  // System health check
  async getSystemHealth() {
    try {
      // Check if API is responding by testing a known endpoint
      await adminApi.get('/configurationsReserve');
      return { 
        success: true, 
        data: { 
          status: 'healthy', 
          database: 'connected',
          api: 'responding'
        } 
      };
    } catch (error) {
      return { 
        success: false, 
        data: { 
          status: 'unhealthy', 
          database: 'unknown',
          api: 'not responding'
        } 
      };
    }
  }
};

export default adminService;
