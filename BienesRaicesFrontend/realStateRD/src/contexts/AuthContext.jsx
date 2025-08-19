import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, tokenManager } from '../components/Auth/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = tokenManager.getToken();
        const userData = tokenManager.getUser();
        
        if (token && userData) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear potentially corrupted data
        tokenManager.clearAll();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const result = await authService.login(credentials);
      if (result.success) {
        const userData = tokenManager.getUser();
        setUser(userData);
        setIsAuthenticated(true);
        
        // Redirect to appropriate dashboard based on user role
        setTimeout(() => {
          if (userData?.role === 'Admin') {
            window.location.href = '/admin';
          } else {
            window.location.href = '/dashboard';
          }
        }, 100);
      }
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Error durante el inicio de sesión' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const result = await authService.register(userData);
      if (result.success) {
        const user = tokenManager.getUser();
        setUser(user);
        setIsAuthenticated(true);
        
        // Redirect new users to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      }
      return result;
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Error durante el registro' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    // Redirect to home after logout
    window.location.href = '/';
  };

  const updateUser = (userData) => {
    setUser(userData);
    tokenManager.setUser(userData);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
