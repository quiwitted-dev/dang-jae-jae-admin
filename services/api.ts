import { MainTitleResponse } from '@/types/type';

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
