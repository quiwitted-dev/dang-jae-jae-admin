'use client';

import { deleteBookmark, postBookmark } from '@/services/bookmark.api';
import { BookmarkIcon } from 'lucide-react';
import { MouseEvent, useState } from 'react';

const Bookmark = ({ id }: { id: string }) => {
  const [loading, setLoading] = useState(false);
  const [isMark, setIsMark] = useState(false);

  const handleToggleBookmark = async (id: string, e: MouseEvent) => {
    e.stopPropagation();
    e.stopPropagation();

    if (loading) return;

    setLoading(true);

    try {
      if (!isMark) {
        const data = await postBookmark(id);
        if (!data) throw new Error('등록 실패');
        setIsMark(true);
      } else {
        const data = await deleteBookmark(id);
        if (!data) throw new Error('삭제 실패');
        setIsMark(false);
      }
    } catch (err) {
      console.error(err);
      alert('북마크 요청이 실패했습니다.'); // 혹은 toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isMark ? (
        <BookmarkIcon
          size={16}
          onClick={(e) => {
            handleToggleBookmark(id, e);
          }}
        />
      ) : (
        <BookmarkIcon
          size={16}
          onClick={(e) => {
            handleToggleBookmark(id, e);
          }}
        />
      )}
    </>
  );
};

export default Bookmark;
