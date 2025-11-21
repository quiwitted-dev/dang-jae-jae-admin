'use client';

import {
  deleteBookmark,
  getBookmark,
  postBookmark,
} from '@/services/bookmark.api';
import { BookmarkIcon } from 'lucide-react';
import { MouseEvent, useEffect, useState } from 'react';

type BookMarkProps = {
  referenceId: string;
  bookmarkId?: string;
  isFavorite: boolean;
};

const Bookmark = ({ referenceId, bookmarkId, isFavorite }: BookMarkProps) => {
  const [loading, setLoading] = useState(false);
  const [favorite, setFavorite] = useState(isFavorite);
  const [currentBookmarkId, setCurrentBookmarkId] = useState(bookmarkId);

  useEffect(() => {
    setFavorite(isFavorite);
    setCurrentBookmarkId(bookmarkId);
  }, [isFavorite, bookmarkId]);

  const handleToggleBookmark = async (id: string, e: MouseEvent) => {
    e.stopPropagation();

    if (loading) return;

    setLoading(true);

    try {
      if (!favorite) {
        const created = await postBookmark(referenceId);
        // post 응답에 id가 없을 때를 대비해 리스트 재조회로 보정
        let newId = created?.data?.id ?? created?.id;
        if (!newId) {
          const { favorites } = await getBookmark();
          const found = favorites?.find(
            (fav: any) =>
              fav.referenceId === referenceId || fav.id === referenceId
          );
          newId = found?.id ?? referenceId;
        }
        setCurrentBookmarkId(newId);
        setFavorite(true);
      } else {
        const target = currentBookmarkId ?? referenceId;
        const data = await deleteBookmark(target);
        if (!data) throw new Error('삭제 실패');
        setFavorite(false);
        setCurrentBookmarkId(undefined);
      }
    } catch (err) {
      console.error(err);
      alert('북마크 요청이 실패했습니다.'); // 혹은 toast
    } finally {
      setLoading(false);
    }
  };

  if (!referenceId) return null;

  return (
    <>
      {favorite ? (
        <BookmarkIcon
          fill="black"
          size={16}
          onClick={(e) => {
            handleToggleBookmark(referenceId, e);
          }}
        />
      ) : (
        <BookmarkIcon
          size={16}
          onClick={(e) => {
            handleToggleBookmark(referenceId, e);
          }}
        />
      )}
    </>
  );
};

export default Bookmark;
