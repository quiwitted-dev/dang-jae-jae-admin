'use client';

import CompareButton from '@/components/common/CompareButton';
import { Button } from '@/components/ui/button';
import {
  deleteBookmark,
  getBookmark,
  postBookmark,
} from '@/services/bookmark.api';
import useAuthStore from '@/store/useAuthStore';
import useStore from '@/store/useStore';
import { BookmarkIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type Props = {
  id: string;
  type: 'PUBLIC_DATA' | 'SUBMISSION';
  address: string;
};

const BookmarkCompareGroup = ({ id, type, address }: Props) => {
  useEffect(() => {
    (async () => {
      const data = await getBookmark();
      const favorite = data.favorites.find((item) => item.referenceId === id);
      if (favorite) {
        setIsFavorite(true);
        setCurrentBookmarkId(favorite.id);
      } else {
        setIsFavorite(false);
        setCurrentBookmarkId(undefined);
      }
    })();
    setAddress(address);
  }, []);

  const [loading, setLoading] = useState(false);
  const { isLogin } = useAuthStore();
  const { toggleOpen, setAddress } = useStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentBookmarkId, setCurrentBookmarkId] = useState<
    string | undefined
  >(undefined);

  const handleToggleBookmark = async (id: string) => {
    if (loading) return;
    if (!isLogin) {
      toast('로그인이 필요합니다.');
      toggleOpen();
      return;
    }

    setLoading(true);

    try {
      if (!isFavorite) {
        const created = await postBookmark(id, type);
        // post 응답에 id가 없을 때를 대비해 리스트 재조회로 보정
        let newId = created?.data?.id ?? created?.id;
        if (!newId) {
          const { favorites } = await getBookmark();
          const found = favorites?.find(
            (fav: any) => fav.referenceId === id || fav.id === id
          );
          newId = found?.id ?? id;
        }
        setCurrentBookmarkId(newId);
        setIsFavorite(true);
      } else {
        const target = currentBookmarkId ?? id;
        const data = await deleteBookmark(target);
        if (!data) throw new Error('삭제 실패');
        setIsFavorite(false);
        setCurrentBookmarkId(undefined);
      }
    } catch (err) {
      console.error(err);
      const message = JSON.parse((err as Error).message).error;
      toast(message); // 혹은 toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-row gap-3 items-center">
      <Button
        className={`rounded-full w-10 h-10 border cursor-pointer ${
          isFavorite ? 'border-black bg-transparent' : 'border-transparent '
        }`}
        onClick={(e) => {
          handleToggleBookmark(id);
        }}
      >
        {isFavorite ? (
          <BookmarkIcon fill="black" size={16} className="text-black" />
        ) : (
          <BookmarkIcon size={16} />
        )}
      </Button>
      <CompareButton id={id} type={type} />
    </div>
  );
};

export default BookmarkCompareGroup;
