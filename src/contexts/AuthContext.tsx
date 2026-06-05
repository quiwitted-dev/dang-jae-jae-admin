import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Admin } from '../types';
import { authService } from '../services/authService';
import { ADMIN_UNAUTHORIZED_EVENT } from '../api';

interface AuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  error: string | null;
  login: (admin: Admin) => void;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 초기 인증 상태 확인 및 토큰 갱신
    const initializeAuth = async () => {
      setIsLoading(true);
      const storedAdmin = authService.getCurrentAdmin();
      
      if (storedAdmin) {
        // 로컬 스토리지에 admin 정보가 있으면 refresh 토큰으로 액세스 토큰 재발급 시도
        try {
          const refreshResponse = await authService.refresh();
          
          if (refreshResponse.success) {
            // 토큰 갱신 성공 - admin 정보 유지
            setAdmin(storedAdmin);
            setError(null);
          } else {
            // 토큰 갱신 실패 - 로컬 스토리지 삭제
            localStorage.removeItem('admin');
            setAdmin(null);
            setError(null);
          }
        } catch (err) {
          // 토큰 갱신 실패 - 로컬 스토리지 삭제
          localStorage.removeItem('admin');
          setAdmin(null);
          setError(null);
        }
      } else {
        // 로컬 스토리지에 admin 정보가 없음
        setAdmin(null);
        setError(null);
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem('admin');
      setAdmin(null);
      setError('세션이 만료되어 다시 로그인해야 합니다.');
      setIsLoading(false);
      navigate('/login', {
        replace: true,
        state: {
          sessionExpired: true,
          sessionMessage: '세션이 만료되어 다시 로그인해야 합니다.',
        },
      });
    };

    window.addEventListener(ADMIN_UNAUTHORIZED_EVENT, handleUnauthorized);

    return () => {
      window.removeEventListener(ADMIN_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [navigate]);

  const handleLogin = (adminData: Admin) => {
    setAdmin(adminData);
    setError(null);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setAdmin(null);
      setError(null);
      navigate('/login');
    } catch (err) {
      setError('로그아웃 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = () => {
    return admin !== null;
  };

  const value = {
    admin,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { admin, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // 로딩이 완료되고 admin이 없을 때만 로그인 페이지로 리다이렉트
    if (!isLoading && !admin) {
      navigate('/login');
    }
  }, [admin, isLoading, navigate]);
  
  // 로딩 중이면 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <div className="text-gray-600 mt-2">로딩 중...</div>
        </div>
      </div>
    );
  }
  
  // admin이 없으면 null (리다이렉트가 처리됨)
  if (!admin) {
    return null;
  }
  
  return <>{children}</>;
};
