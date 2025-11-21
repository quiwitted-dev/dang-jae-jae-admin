import { Favorites } from '@/types/favorite.type';

export const getBookmark = async (): Promise<Favorites> => {
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
};

export const postBookmark = async (id: string) => {
  const res = await fetch(`/api/favorite`, {
    method: 'POST',
    body: JSON.stringify({ referenceId: id, dataType: 'PUBLIC_DATA' }),
  });

  if (res.status === 401) {
    return;
  }

  if (!res.ok) {
    throw new Error(`북마크 등록 실패${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data;
};

export const deleteBookmark = async (id: string) => {
  const res = await fetch(`/api/favorite/`, {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  });

  if (!res.ok) {
    throw new Error(`북마크 삭제 실패${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data;
};
