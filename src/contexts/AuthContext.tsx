'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, LoginRequest, RegisterRequest, ApiError } from '@/lib/api';
import { tokenStorage, isAuthenticated as checkAuth } from '@/lib/auth';

interface User {
  id: number;
  email: string;
  displayName: string;
  gender: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = () => {
      const authenticated = checkAuth();
      setIsAuthenticated(authenticated);
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      const response = await authApi.login(data);
      tokenStorage.setToken(response.access_token);
      setIsAuthenticated(true);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.status === 401 ? '이메일 또는 비밀번호가 잘못되었습니다.' : '로그인에 실패했습니다.');
      }
      throw error;
    }
  };

  const register = async (data: RegisterRequest): Promise<User> => {
    try {
      const response = await authApi.register(data);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          throw new Error('이미 존재하는 이메일입니다.');
        } else if (error.status === 400) {
          throw new Error('입력한 정보를 다시 확인해주세요.');
        }
        throw new Error('회원가입에 실패했습니다.');
      }
      throw error;
    }
  };

  const logout = () => {
    tokenStorage.removeToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
      }}
    >
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