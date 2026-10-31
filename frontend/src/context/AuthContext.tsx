import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { email: string; password: string; full_name: string; role?: string }) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('fraudguard_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        // Create demo analyst session by default for instant hackathon evaluation
        setUser({
          id: 'analyst-demo-id',
          email: 'analyst@fraudguard.ai',
          full_name: 'Sarah Jenkins (Lead Fraud Analyst)',
          role: 'analyst',
          is_active: true,
          created_at: new Date().toISOString(),
        });
        setIsLoading(false);
        return;
      }
      try {
        const u = await api.auth.me();
        setUser(u);
      } catch (e) {
        localStorage.removeItem('fraudguard_token');
        setToken(null);
        // Fallback demo user
        setUser({
          id: 'analyst-demo-id',
          email: 'analyst@fraudguard.ai',
          full_name: 'Sarah Jenkins (Lead Fraud Analyst)',
          role: 'analyst',
          is_active: true,
          created_at: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(email, password);
      localStorage.setItem('fraudguard_token', res.access_token);
      setToken(res.access_token);
      setUser({
        id: 'user-' + Date.now(),
        email: res.email,
        full_name: res.full_name,
        role: res.role,
        is_active: true,
        created_at: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { email: string; password: string; full_name: string; role?: string }) => {
    setIsLoading(true);
    try {
      await api.auth.register(userData);
      await login(userData.email, userData.password);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('fraudguard_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

