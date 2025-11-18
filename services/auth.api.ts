import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const permissionKakao = async () => {
  redirect(`${API_URL}/api/auth/kakao`);
};

export const LoginKakao = async (code: string) => {
  const res = await fetch(`/api/auth/kakao/callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || '카카오 로그인에 실패했습니다.');
  }

  const data = await res.json();

  return data;
};

export const logout = async () => {
  try {
    const res = await fetch(`/api/auth/logout`, { method: 'POST' });
    if (!res.ok) {
      throw new Error('로그아웃 실패');
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('logout 에러 : ', error);
    return { success: false };
  }
};
