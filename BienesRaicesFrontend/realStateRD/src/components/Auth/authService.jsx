import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management utilities
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

export const tokenManager = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token) => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  removeRefreshToken: () => localStorage.removeItem(REFRESH_TOKEN_KEY),
  
  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),
  
  clearAll: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/api/Auth/refresh-token`, {
            token: tokenManager.getToken(),
            refreshToken: refreshToken
          });
          
          const { token: newToken, refreshToken: newRefreshToken } = response.data;
          tokenManager.setToken(newToken);
          tokenManager.setRefreshToken(newRefreshToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          tokenManager.clearAll();
          return Promise.reject(refreshError);
        }
      } else {
        tokenManager.clearAll();
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth service functions
export const authService = {
  async register(userData) {
    try {
      const response = await api.post('/Auth/register', {
        email: userData.email,
        username: userData.username,
        password: userData.password
      });
      
      // Backend returns AuthResponseDto directly
      const authData = response.data;
      
      // Store tokens and user data
      tokenManager.setToken(authData.token);
      tokenManager.setRefreshToken(authData.refreshToken);
      tokenManager.setUser({
        id: authData.id,
        username: authData.username,
        email: authData.email,
        role: authData.role
      });
      
      toast.success('¡Registro exitoso! Bienvenido a RealStateRD');
      return { success: true, data: authData };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0] || 
                          'Error en el registro. Por favor intenta de nuevo.';
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  async login(credentials) {
    try {
      console.log('🔍 Login attempt with data:', {
        email: credentials.email,
        password: credentials.password ? '[HIDDEN]' : 'EMPTY',
        passwordLength: credentials.password?.length || 0
      });

      const response = await api.post('/Auth/login', {
        email: credentials.email,
        password: credentials.password
      });
      
      console.log('✅ Login successful:', response.data);
      
      // Backend returns AuthResponseDto directly
      const authData = response.data;
      
      // Store tokens and user data
      tokenManager.setToken(authData.token);
      tokenManager.setRefreshToken(authData.refreshToken);
      tokenManager.setUser({
        id: authData.id,
        username: authData.username,
        email: authData.email,
        role: authData.role
      });
      
      toast.success(`¡Bienvenido de vuelta, ${authData.username || authData.email}!`);
      return { success: true, data: authData };
    } catch (error) {
      console.error('❌ Login error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0] || 
                          'Credenciales inválidas. Por favor verifica tu email y contraseña.';
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  logout() {
    tokenManager.clearAll();
    toast.info('Sesión cerrada correctamente');
  },

  getCurrentUser() {
    return tokenManager.getUser();
  },

  isAuthenticated() {
    const token = tokenManager.getToken();
    const user = tokenManager.getUser();
    return !!(token && user);
  },

  async refreshToken() {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/Auth/refresh-token', {
        token: tokenManager.getToken(),
        refreshToken: refreshToken
      });

      const { token: newToken, refreshToken: newRefreshToken } = response.data;
      tokenManager.setToken(newToken);
      tokenManager.setRefreshToken(newRefreshToken);

      return { success: true, token: newToken };
    } catch (error) {
      this.logout();
      return { success: false, error: 'Failed to refresh token' };
    }
  }
};

// Backward compatibility exports
export const register = authService.register;
export const login = authService.login;
export const logout = authService.logout;

export default authService;
