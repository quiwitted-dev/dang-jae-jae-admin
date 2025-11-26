'use client';

import useStore from '@/store/useStore';
import ProjectCard from '../common/ProjectCard';
import Link from 'next/link';
import SettingsNavigation from './SettingsNavigation';
import { getSettingsContent } from '@/lib/getSettingsContent';
import { useEffect, useState } from 'react';
import { getBookmark } from '@/services/bookmark.api';
import { ApprovedSubmission } from '@/types/submission.type';

const RightSide = () => {
  const myPageTab = useStore((state) => state.myPageTab);
  const settingsTab = useStore((state) => state.settingsTab);
  const [myBookmark, setMyBookmark] = useState<ApprovedSubmission[]>([]);

  useEffect(() => {
    (async () => {
      const data = await getBookmark();
      setMyBookmark(data.favorites);
    })();
  }, []);

  const handleFavoriteChange = (bookmarkId: string) => {
    setMyBookmark((prev) => prev.filter((f) => f.id !== bookmarkId));
  };

  const getTabTitle = () => {
    switch (settingsTab) {
      case 'privacy':
        return '개인정보처리방침';
      case 'policies':
        return '이용약관 및 정책';
      case 'analysis':
        return '맞춤형 통계 분석 참여 동의';
      case 'service':
        return '서비스 문의하기';
      default:
        return '';
    }
  };

  if (!myBookmark) return null;

  return (
    <div className="flex flex-col w-full md:px-9 md:pt-16 md:gap-20">
      <div className="flex flex-row justify-between items-center">
        <h3 className="hidden lg:block text-4xl font-bold">{getTabTitle()}</h3>
        <div className="hidden lg:block">
          <SettingsNavigation />
        </div>
      </div>

      {/* Todo : 북마크는 max 3개 */}
      {myPageTab === 'none' && (
        <div className="grid 3xl:grid-cols-3 2xl:grid-cols-2 grid-cols-1 gap-4 mb-16 lg:mb-0">
          {myBookmark.map((item, index) => (
            <div
              className="flex flex-col gap-4 text-[#FAFFCE] relative"
              key={index}
            >
              <h3 className="text-4xl text-center font-medium">
                {item.address.split(' ').slice(2).join(' ')}
              </h3>
              <Link href={`/${item.referenceId}?type=${item.dataType}`}>
                <div className="relative z-0 mx-auto">
                  <ProjectCard
                    item={item}
                    isFavorite={true}
                    handleFavoriteChange={handleFavoriteChange}
                  />
                </div>
              </Link>
              {/* <p className="text-center text-base">{item.project_name}</p> */}
            </div>
          ))}
        </div>
      )}

      {myPageTab === 'settings' && (
        <div className="hidden lg:block">{getSettingsContent(settingsTab)}</div>
      )}
    </div>
  );
};
export default RightSide;
