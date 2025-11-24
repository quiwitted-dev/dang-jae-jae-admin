'use client';

import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import Image from 'next/image';
import Link from 'next/link';
import ProjectCard from '../common/ProjectCard';
import {
  ApprovedSubmission,
  ApprovedSubmissionList,
} from '@/types/submission.type';
import { useEffect, useState } from 'react';
import { getBookmark } from '@/services/bookmark.api';

const LeftSide = ({ data }: { data: ApprovedSubmissionList }) => {
  const submissions = data.submissions.slice(0, 1000);
  const [favorites, setFavorites] = useState<ApprovedSubmission[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      const data = await getBookmark();
      setFavorites(data.favorites ?? []);
      setIsLoaded(true);
    };
    fetchFavorites();
  }, []);

  const favoriteSet = new Set(
    favorites.map((f) => f.referenceId ?? f.id ?? '')
  );
  const favoriteIdMap = new Map(
    favorites.map((f) => [f.referenceId ?? f.id ?? '', f.id])
  );

  return (
    <div className="flex flex-col max-w-[700px] w-full gap-4">
      {/* 목록 */}
      <div className="flex flex-col gap-2 md:px-[120px] px-2">
        {submissions.map((item) => {
          const isFavorite = isLoaded ? favoriteSet.has(item.id) : false;
          const favoriteId = favoriteIdMap.get(item.id);
          return (
            <ProjectCard
              key={item.id}
              item={item}
              isFavorite={isFavorite}
              favoriteId={favoriteId}
            />
          );
        })}
      </div>
      <div className="relative flex flex-col flex-1 min-h-[650px] mt-10">
        <Image
          src={'/faces.png'}
          width={400}
          height={300}
          alt="얼굴 아이콘들"
          className="absolute bottom-0 left-0 right-0 w-full object-contain -z-10 md:px-[120px]"
        />

        <div>
          <p className="text-white whitespace-pre-line break-keep text-center text-[28px] font-bold">
            {`찾는 사업장이 없나요? \n예정지 인가요? \n사업장을 추가하여 \n다른사람들에게 알려주세요`}
          </p>
        </div>

        <Link href={'/expected_add'}>
          <Button
            className="absolute mx-auto bottom-9 left-1/2 -translate-x-1/2 text-[25px] font-semibold rounded-full cursor-pointer"
            size={'lg'}
          >
            <Plus /> 예정지 추가하기
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default LeftSide;
