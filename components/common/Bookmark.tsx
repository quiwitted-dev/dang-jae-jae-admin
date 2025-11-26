'use client';

import {
  deleteBookmark,
  getBookmark,
  postBookmark,
} from '@/services/bookmark.api';
import useAuthStore from '@/store/useAuthStore';
import useStore from '@/store/useStore';
import { ApprovedSubmission } from '@/types/submission.type';
import { BookmarkIcon } from 'lucide-react';
import { MouseEvent, useEffect, useState } from 'react';

type BookMarkProps = {
  item: ApprovedSubmission;
  bookmarkId?: string;
  isFavorite: boolean;
  handleFavoriteChange?: (bookmarkId: string) => void;
};

const Bookmark = ({
  item,
  bookmarkId,
  isFavorite,
  handleFavoriteChange,
}: BookMarkProps) => {
  const isLogin = useAuthStore((state) => state.isLogin);
  const [loading, setLoading] = useState(false);
  const [favorite, setFavorite] = useState(isFavorite);
  const [currentBookmarkId, setCurrentBookmarkId] = useState(bookmarkId);
  const { toggleOpen } = useStore();

  useEffect(() => {
    setFavorite(isFavorite);
    setCurrentBookmarkId(bookmarkId);
  }, [isFavorite, bookmarkId]);

  useEffect(() => {
    if (!isLogin) {
      setFavorite(false);
      setCurrentBookmarkId(undefined);
    }
  }, [isLogin]);

  const handleToggleBookmark = async (id: string, e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (loading) return;
    if (!isLogin) {
      alert('로그인이 필요합니다.');
      toggleOpen();
      return;
    }

    setLoading(true);

    try {
      if (!favorite) {
        const created = await postBookmark(item.id, item.dataType);
        // post 응답에 id가 없을 때를 대비해 리스트 재조회로 보정
        let newId = created?.data?.id ?? created?.id;
        if (!newId) {
          const { favorites } = await getBookmark();
          const found = favorites?.find(
            (fav: any) => fav.referenceId === item.id || fav.id === item.id
          );
          newId = found?.id ?? item.id;
        }
        setCurrentBookmarkId(newId);
        setFavorite(true);
      } else {
        const target = currentBookmarkId ?? item.id;
        const data = await deleteBookmark(target);
        if (!data) throw new Error('삭제 실패');
        setFavorite(false);
        setCurrentBookmarkId(undefined);
        handleFavoriteChange?.(target);
      }
    } catch (err) {
      console.error(err);
      alert('북마크 요청이 실패했습니다.'); // 혹은 toast
    } finally {
      setLoading(false);
    }
  };

  if (!item.id) return null;

  return (
    <>
      {favorite ? (
        <BookmarkIcon
          fill="black"
          size={16}
          onClick={(e) => {
            handleToggleBookmark(item.id, e);
          }}
        />
      ) : (
        <BookmarkIcon
          size={16}
          onClick={(e) => {
            handleToggleBookmark(item.id, e);
          }}
        />
      )}
    </>
  );
};

export default Bookmark;
