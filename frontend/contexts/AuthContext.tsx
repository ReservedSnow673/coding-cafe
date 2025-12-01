'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { DEV_MODE, mockDelay, MOCK_OTP } from '@/lib/devMode';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  role: string;
  year?: number;
  branch?: string;
  hostel?: string;
  profile_picture?: string;
  bio?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, otp: string) => Promise<any>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  requestOTP: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Dev Mode: Use mock user
      if (DEV_MODE.useMockData) {
        const mockUser = localStorage.getItem('mock_user');
        if (mockUser) {
          setUser(JSON.parse(mockUser));
        }
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('access_token');
      if (token) {
        const response = await api.get('/auth/me');
        setUser(response.data);
      }
    } catch (error) {
      localStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  };

  const requestOTP = async (email: string) => {
    // Dev Mode: Return mock OTP
    if (DEV_MODE.useMockData) {
      await mockDelay();
      return { 
        message: 'OTP sent to email', 
        otp: MOCK_OTP,
        email 
      };
    }

    const response = await api.post('/api/auth/request-otp', { email });
    // Backend returns OTP in response for SMTP bypass mode (development)
    return response.data;
  };

  const login = async (email: string, otp: string) => {
    // Dev Mode: Mock login
    if (DEV_MODE.useMockData) {
      await mockDelay();
      
      // Check if user exists in mock storage
      const existingUser = localStorage.getItem('mock_user');
      
      if (existingUser) {
        // Existing user - return user data
        const user = JSON.parse(existingUser);
        localStorage.setItem('mock_token', DEV_MODE.mockToken);
        setUser(user);
        return { user, access_token: DEV_MODE.mockToken };
      } else {
        // New user - require registration
        return { 
          message: 'OTP verified. Please complete registration.',
          requires_registration: true,
          email 
        };
      }
    }

    const response = await api.post('/api/auth/verify-otp', {
      email,
      otp_code: otp,
    });
    return response.data;
  };

  const register = async (userData: any) => {
    // Dev Mode: Mock registration
    if (DEV_MODE.useMockData) {
      await mockDelay();
      const mockUser = {
        ...DEV_MODE.mockUser,
        email: userData.email,
        full_name: userData.full_name,
        phone_number: userData.phone_number,
        year: userData.year,
        branch: userData.branch,
        hostel: userData.hostel,
        bio: userData.bio,
        is_verified: true,
      };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      localStorage.setItem('mock_token', DEV_MODE.mockToken);
      setUser(mockUser);
      router.push('/');
      return;
    }

    const response = await api.post('/api/auth/register', userData);
    const { access_token, user } = response.data;
    localStorage.setItem('access_token', access_token);
    setUser(user);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, requestOTP }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
