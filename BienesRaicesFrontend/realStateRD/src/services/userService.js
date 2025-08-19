import axios from 'axios';
import { tokenManager } from '../components/Auth/authService';

// Create axios instance with proper configuration
const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure axios interceptors for automatic token handling
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/Auth/refresh-token`, {
            token: tokenManager.getToken(),
            refreshToken: refreshToken
          });
          
          const { token: newToken, refreshToken: newRefreshToken } = response.data;
          tokenManager.setToken(newToken);
          tokenManager.setRefreshToken(newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        tokenManager.clearAll();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

class UserService {
  // Dashboard operations
  async getDashboard() {
    try {
      const response = await api.get('/bookings/dashboard');
      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error getting dashboard:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cargar el dashboard',
        statusCode: error.response?.status || 500
      };
    }
  }

  // Available slots operations
  async getAvailableSlots(startDate, endDate) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await api.get(`/bookings/available-slots?${params.toString()}`);
      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error getting available slots:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cargar horarios disponibles',
        statusCode: error.response?.status || 500
      };
    }
  }

  // Booking operations
  async createBooking(timeSlotId) {
    try {
      const response = await api.post('/bookings', {
        timeSlotId: timeSlotId
      });
      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || '¡Reserva creada exitosamente!'
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear la reserva',
        statusCode: error.response?.status || 500
      };
    }
  }

  async getUserBookings() {
    try {
      const response = await api.get('/bookings/my-bookings');
      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error getting user bookings:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cargar tus reservas',
        statusCode: error.response?.status || 500
      };
    }
  }

  async cancelBooking(bookingId) {
    try {
      const response = await api.delete(`/bookings/${bookingId}`);
      return {
        success: response.data.success || true,
        data: response.data.data || response.data,
        message: response.data.message || 'Reserva cancelada exitosamente'
      };
    } catch (error) {
      console.error('Error canceling booking:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cancelar la reserva',
        statusCode: error.response?.status || 500
      };
    }
  }

  // Utility methods
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-DO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(timeString) {
    if (!timeString) return 'N/A';
    const timeParts = timeString.split(':');
    return `${timeParts[0]}:${timeParts[1]}`;
  }

  getStatusColor(status) {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case '1':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
      case '2':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      case '0':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getStatusText(status) {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case '1':
        return 'Confirmada';
      case 'cancelled':
      case '2':
        return 'Cancelada';
      case 'pending':
      case '0':
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
  }

  getAvailabilityColor(available, max) {
    const percentage = (available / max) * 100;
    if (percentage === 0) return 'bg-red-500';
    if (percentage <= 25) return 'bg-orange-500';
    if (percentage <= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  isSlotFull(slot) {
    return slot.availableSlots === 0;
  }

  // Check if a time slot has already passed
  isSlotPastTime(slot) {
    const now = new Date();
    const slotDate = new Date(slot.slotDate);
    const [hours, minutes] = slot.endTime.split(':').map(Number);
    
    // Set the slot end time
    slotDate.setHours(hours, minutes, 0, 0);
    
    // Return true if current time is past the slot end time
    return now > slotDate;
  }

  // Check if booking is allowed for a slot (not full and not past time)
  canBookSlot(slot) {
    return !this.isSlotFull(slot) && !this.isSlotPastTime(slot);
  }

  groupSlotsByDate(slots) {
    const grouped = {};
    slots.forEach(slot => {
      const date = slot.slotDate;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(slot);
    });
    return grouped;
  }

  // Validation methods
  validateBookingData(timeSlotId) {
    if (!timeSlotId) {
      return {
        isValid: false,
        error: 'ID del horario es requerido'
      };
    }

    if (typeof timeSlotId !== 'number' || timeSlotId <= 0) {
      return {
        isValid: false,
        error: 'ID del horario debe ser un número válido'
      };
    }

    return { isValid: true };
  }

  validateDateRange(startDate, endDate) {
    if (!startDate || !endDate) {
      return {
        isValid: false,
        error: 'Fechas de inicio y fin son requeridas'
      };
    }

    // Parse dates properly to avoid timezone issues
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Allow today's date - only reject if start date is before today
    if (start.getTime() < today.getTime()) {
      return {
        isValid: false,
        error: 'La fecha de inicio no puede ser anterior a hoy'
      };
    }

    if (end.getTime() < start.getTime()) {
      return {
        isValid: false,
        error: 'La fecha de fin no puede ser anterior a la fecha de inicio'
      };
    }

    const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 90) {
      return {
        isValid: false,
        error: 'El rango de fechas no puede ser mayor a 90 días'
      };
    }

    return { isValid: true };
  }

  // Error handling
  handleApiError(error, defaultMessage = 'Error en la operación') {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || defaultMessage;
      
      switch (status) {
        case 400:
          return `Solicitud inválida: ${message}`;
        case 401:
          return 'No autorizado. Por favor, inicia sesión nuevamente.';
        case 403:
          return 'No tienes permisos para realizar esta acción.';
        case 404:
          return 'Recurso no encontrado.';
        case 409:
          return `Conflicto: ${message}`;
        case 422:
          return `Datos inválidos: ${message}`;
        case 500:
          return 'Error interno del servidor. Intenta más tarde.';
        default:
          return message;
      }
    } else if (error.request) {
      // Request was made but no response received
      return 'No se pudo conectar con el servidor. Verifica tu conexión.';
    } else {
      // Something else happened
      return error.message || defaultMessage;
    }
  }
}

export const userService = new UserService();
export default userService;
