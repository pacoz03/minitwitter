'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

interface User {
  id: string;
  username: string;
  email: string;
  has_otp: boolean;
  bio?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('jwt');
    if (token) {
      try {
        const data = await apiClient<{ user: User }>('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(data.user);
      } catch (error) {
        console.error('Failed to fetch user, logging out.', error);
        localStorage.removeItem('jwt');
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = (token: string, user: User) => {
    localStorage.setItem('jwt', token);
    setUser(user);
  };

  const logout = async () => {
    const token = localStorage.getItem('jwt');
    try {
        if(token) {
            await apiClient('/api/auth/logout', { 
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` } 
            });
        }
    } catch (error) {
        console.error("Logout failed, but clearing session locally.", error)
    } finally {
        localStorage.removeItem('jwt');
        setUser(null);
        router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
