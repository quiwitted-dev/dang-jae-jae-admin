import { MainTitleResponse } from '@/types/type';

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getMainTitle = async (): Promise<MainTitleResponse> => {
    const res = await fetch(`${API_URL}/api/main-title1`, {
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
};
