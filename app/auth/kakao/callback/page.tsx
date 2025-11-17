'use client';

import { kakaoLogin } from '@/services/api';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function KakaoCallbackPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const router = useRouter();

  useEffect(() => {
    if (!code) return;

    const login = async () => {
      try {
        const res = await kakaoLogin(code);

        // 로그인 성공 처리
        router.replace('/');
      } catch (error) {
        console.error('카카오 로그인 실패:', error);
      }
    };

    login();
  }, [code]);

  return null;
}
