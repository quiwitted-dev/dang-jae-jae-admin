import { FavoriteApiResponse } from '@/types/favorite.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getBookmark = async (): Promise<FavoriteApiResponse> => {
  try {
    const res = await fetch(`/api/favorite`, {
      method: 'GET',
    });

    if (res.status === 401) {
      return {
        success: false,
        favorites: [],
      };
    }

    if (!res.ok) {
      throw new Error(`북마크 조회 실패 ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('getBookmark 에러 : ', error);
    return {
      success: false,
      favorites: [],
    };
  }
};

export const postBookmark = async (id: string) => {
  try {
    const res = await fetch(`/api/favorite`, {
      method: 'POST',
      body: JSON.stringify({ referenceId: id, dataType: 'PUBLIC_DATA' }),
    });

    if (!res.ok) {
      throw new Error('북마크 등록 실패');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('postBookmark 에러 : ', error);
  }
};

export const deleteBookmark = async (id: string) => {
  try {
    const res = await fetch(`/api/favorite/`, {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });

    if (!res.ok) {
      throw new Error('북마크 삭제 실패');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('deleteBookmark 에러 : ', error);
  }
};
