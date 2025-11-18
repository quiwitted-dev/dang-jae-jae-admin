import { ApprovedSubmissionList, MainTitleResponse } from '@/types/type';
import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getMainTitle = async (): Promise<MainTitleResponse> => {
  try {
    const res = await fetch(`${API_URL}/api/main-title`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`API 요청 실패: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    return data;
  } catch (error) {
    console.error('getMainTitle 에러:', error);
    // 에러 시 기본값 반환
    return {
      success: false,
      mainTitle: {
        id: '',
        title:
          '복잡한 정비사업? 데이터로 1분 만에 끝내세요! 친절하고 쉬운 통합 데이터로 딱 핵심만 알려드릴게요. 가장 확실한 투자 독립! 지금 바로 무료로 시작해보세요.',
        createdAt: '',
        updatedAt: '',
      },
    };
  }
};

export const getApprovedBusiness =
  async (): Promise<ApprovedSubmissionList> => {
    try {
      const res = await fetch(`${API_URL}/api/submission/approved`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache',
      });

      if (!res.ok) {
        throw new Error(`API 요청 실패: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      return data;
    } catch (error) {
      console.error('getApprovedBusiness 에러:', error);
      // 에러 시 기본값 반환
      return {
        success: false,
        submissions: [],
        total: 0,
      };
    }
  };

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
  }
};

export const getSubmissionDetail = async () => {
  try {
    const res = await fetch(`${API_URL}/api/submisson`, { method: 'POST' });
    if (!res.ok) {
      throw new Error('로그아웃 실패');
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('getSubmissionDetail 에러 : ', error);
  }
};
