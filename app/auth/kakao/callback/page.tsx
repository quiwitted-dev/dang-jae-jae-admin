'use client';

import { LoginKakao } from '@/services/auth.api';
import useAuthStore from '@/store/useAuthStore';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function KakaoCallbackPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const router = useRouter();
  const setIsLogin = useAuthStore((state) => state.setIsLogin);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (!code) return;

    const login = async () => {
      try {
        const res = await LoginKakao(code);
        const { id, nickname: name } = res.user;
        setIsLogin(true);
        setUser({ id, name });

        // Todo : 이전에 로그인 했던 위치 기억해서 거기로 reidrect
        router.replace('/');
      } catch (error: any) {
        console.error('카카오 로그인 실패:', error);
        alert(error.message || '카카오 로그인에 실패했습니다. 다시 시도해주세요.');
        router.replace('/');
      }
    };

    login();
  }, [code]);

  return null;
}
