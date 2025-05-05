import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS, post } from '../utils/api';

// Types
export interface User {
  username: string;
  accountNumber: string;
  isAdmin: boolean;
  token: string;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextData>({
  user: null,
  loading: true,
  login: async () => false,
  register: async () => ({ success: false, message: 'Auth context not initialized' }),
  logout: async () => {},
  isAuthenticated: false,
});

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from storage on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt_token');
        const username = await AsyncStorage.getItem('username');
        const accountNumber = await AsyncStorage.getItem('account_number');
        const isAdmin = await AsyncStorage.getItem('is_admin');

        if (token && username && accountNumber) {
          setUser({
            username,
            accountNumber,
            isAdmin: isAdmin === 'true',
            token,
          });
        }
      } catch (error) {
        console.error('Failed to load user from storage', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const response = await post(
        ENDPOINTS.login,
        { username, password }
      );

      if (response.ok && response.data.token) {
        // Determine if user is admin
        const isAdmin = username.toLowerCase() === 'admin';
        
        // Set user state
        const userData = {
          username,
          // accountNumber: response.data.accountNumber || 'ADMIN001', // Default if not provided
          accountNumber: response.data.accountNumber ?? '',
          isAdmin,
          token: response.data.token,
        };
        setUser(userData);
        
        // Save to AsyncStorage
        await AsyncStorage.setItem('jwt_token', response.data.token);
        await AsyncStorage.setItem('username', username);
        await AsyncStorage.setItem('account_number', userData.accountNumber);
        await AsyncStorage.setItem('is_admin', String(isAdmin));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (username: string, password: string) => {
    try {
      setLoading(true);
      
      const response = await post(
        ENDPOINTS.register,
        { username, password }
      );

      return {
        success: response.ok,
        message: response.data.message || 'Registration failed',
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: 'Network error. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear user state
      setUser(null);
      
      // Clear AsyncStorage
      await AsyncStorage.multiRemove([
        'jwt_token',
        'username',
        'account_number',
        'is_admin',
      ]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
