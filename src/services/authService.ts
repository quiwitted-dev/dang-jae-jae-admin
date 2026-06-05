import { adminApi } from '../api';
import type { Admin } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  admin?: {
    id: string;
    email: string;
    nickname: string;
  };
  error?: string;
}

export const authService = {
  // 어드민 로그인
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await adminApi.login(credentials.email, credentials.password);
      if (response.success && response.admin) {
        // 로그인 성공 시 관리자 정보를 localStorage에 저장
        localStorage.setItem('admin', JSON.stringify(response.admin));
      }
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || '로그인 중 오류가 발생했습니다.',
      };
    }
  },

  // 어드민 Refresh Token으로 Access Token 갱신
  async refresh(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await adminApi.refresh();
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || '토큰 갱신 중 오류가 발생했습니다.',
      };
    }
  },

  // 어드민 로그아웃
  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await adminApi.logout();
      localStorage.removeItem('admin');
      return response;
    } catch (error: any) {
      localStorage.removeItem('admin');
      return {
        success: false,
        error: error.response?.data?.error || '로그아웃 중 오류가 발생했습니다.',
      };
    }
  },

  // 현재 어드민 정보 조회
  getCurrentAdmin(): Admin | null {
    const adminStr = localStorage.getItem('admin');
    if (adminStr) {
      return JSON.parse(adminStr);
    }
    return null;
  },

  // 로그인 여부 확인
  isAuthenticated(): boolean {
    return this.getCurrentAdmin() !== null;
  },
};
