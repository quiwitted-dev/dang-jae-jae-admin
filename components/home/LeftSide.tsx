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
import { useEffect, useMemo, useRef, useState } from 'react';
import { getBookmark } from '@/services/bookmark.api';
import LocationFilter from './LocationFilter';
import BusinessTypeFilter from './BusinessTypeFilter';
import BusinessStageFilter from './BusinessStageFilter';
import PriceFilter from './PriceFilter';
import OwnerCountFilter from './OwnerCountFilter';
import NewUnitsFilter from './NewUnitsFilter';
import useFilterStore from '@/store/useFilterStore';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';
import useAuthStore from '@/store/useAuthStore';

const LeftSide = ({ data }: { data: ApprovedSubmissionList }) => {
  const submissions = data.submissions;
  const [favorites, setFavorites] = useState<ApprovedSubmission[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { isLogin } = useAuthStore();
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

  const rawPage = Number(searchParams?.get('page') ?? data.page ?? 1);
  const currentPage =
    Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const pageSize = Math.max(data.pageSize ?? data.limit ?? 10, 1);
  const totalItems = Math.max(data.total ?? 0, 0);
  const totalPages = Math.max(data.totalPages ?? 1, 1);
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const createPageHref = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    const query = params.toString();
    return query ? `?${query}` : '?';
  };

  const paginationItems = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }

    const pages: Array<number | 'ellipsis'> = [];
    const startPage = Math.max(safeCurrentPage - 1, 2);
    const endPage = Math.min(safeCurrentPage + 1, totalPages - 1);

    pages.push(1);

    if (startPage > 2) {
      pages.push('ellipsis');
    }

    for (let page = startPage; page <= endPage; page++) {
      pages.push(page);
    }

    if (endPage < totalPages - 1) {
      pages.push('ellipsis');
    }

    pages.push(totalPages);

    return pages;
  }, [safeCurrentPage, totalPages]);

  useEffect(() => {
    const fetchFavorites = async () => {
      const data = await getBookmark();
      setFavorites(data.favorites ?? []);
      setIsLoaded(true);
    };
    if (isLogin) fetchFavorites();
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
    router.push('?', { scroll: false });
  };

  return (
    <div className="flex flex-col relative max-w-[550px] w-full">
      <div
        className="sticky md:top-0 top-12 z-30 bg-black"
        style={{ top: 'var(--header-offset, 0px)' }}
      >
        <div
          ref={filterRef}
          className="flex flex-row overflow-x-auto md:overflow-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none z-30 bg-black py-2 px-2"
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
          <div className="flex flex-row gap-1">
            <Button
              onClick={handleResetFilters}
              className="bg-[#532f4d] text-black rounded-4xl"
              variant={'ghost'}
            >
              리셋
            </Button>
          </div>
        </div>
      </div>
      {/* 목록 */}
      <div className="flex flex-col gap-2 mx-auto px-2">
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

        {submissions.length > 0 && totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={createPageHref(Math.max(safeCurrentPage - 1, 1))}
                  isDisabled={safeCurrentPage === 1}
                  scroll={false}
                  className="bg-transparent"
                />
              </PaginationItem>
              {paginationItems.map((page, index) =>
                page === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem
                    key={page}
                    onClick={() => {
                      scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <PaginationLink
                      href={createPageHref(page)}
                      isActive={page === safeCurrentPage}
                      scroll={false}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  href={createPageHref(
                    Math.min(safeCurrentPage + 1, totalPages)
                  )}
                  isDisabled={safeCurrentPage === totalPages}
                  scroll={false}
                  className="bg-transparent"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
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
