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
import LocationFilter from './LocationFilter';
import BusinessTypeFilter from './BusinessTypeFilter';
import BusinessStageFilter from './BusinessStageFilter';
import PriceFilter from './PriceFilter';
import OwnerCountFilter from './OwnerCountFilter';
import NewUnitsFilter from './NewUnitsFilter';
import { useRef } from 'react';
import useFilterStore from '@/store/useFilterStore';
import { useRouter, useSearchParams } from 'next/navigation';

const LeftSide = ({ data }: { data: ApprovedSubmissionList }) => {
  const submissions = data.submissions.slice(0, 1000);
  const [favorites, setFavorites] = useState<ApprovedSubmission[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ isDown: false, startX: 0, scrollLeft: 0 });
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    locations,
    projectTypes,
    currentStage,
    price,
    ownerCount,
    newUnits,
    reset,
  } = useFilterStore();

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

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!filterRef.current) return;
    dragState.current = {
      isDown: true,
      startX: e.pageX - filterRef.current.offsetLeft,
      scrollLeft: filterRef.current.scrollLeft,
    };
  };

  const handleMouseLeave = () => {
    dragState.current.isDown = false;
  };

  const handleMouseUp = () => {
    dragState.current.isDown = false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragState.current.isDown || !filterRef.current) return;
    e.preventDefault();
    const x = e.pageX - filterRef.current.offsetLeft;
    const walk = (x - dragState.current.startX) * 1; // speed factor
    filterRef.current.scrollLeft = dragState.current.scrollLeft - walk;
  };

  const handleResetFilters = () => {
    reset();
  };

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams?.toString());
    const setParam = (key: string, value?: string | number | null) => {
      if (value === undefined || value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    };

    params.delete('locations');
    locations.forEach((loc) => params.append('locations', loc));

    params.delete('projectTypes');
    projectTypes.forEach((type) => params.append('projectTypes', type));

    setParam('currentStage', currentStage);
    setParam('minPrice', price.minPrice);
    setParam('maxPrice', price.maxPrice);
    setParam('ownerCountMin', ownerCount.ownerCountMin);
    setParam('ownerCountMax', ownerCount.ownerCountMax);
    setParam('newConstructionUnitsMin', newUnits.newConstructionUnitsMin);
    setParam('newConstructionUnitsMax', newUnits.newConstructionUnitsMax);

    const query = params.toString();
    router.push(query ? `?${query}` : '?', { scroll: false });
  };

  return (
    <div className="flex flex-col max-w-[700px] w-full gap-4">
      <div
        ref={filterRef}
        className="flex flex-row py-4 overflow-x-auto md:overflow-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <LocationFilter />
        <BusinessTypeFilter />
        <BusinessStageFilter />
        <PriceFilter />
        <OwnerCountFilter />
        <NewUnitsFilter />
        <Button onClick={handleSearch}>검색</Button>
        <Button variant="outline" onClick={handleResetFilters}>
          리셋
        </Button>
      </div>
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
