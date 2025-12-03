'use client';

import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { ApprovedSubmission } from '@/types/submission.type';
import Bookmark from './Bookmark';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useQueryParams } from '@/lib/useQueryParams';

type ProjectCardProps = {
  item: ApprovedSubmission;
  isFavorite: boolean;
  favoriteId?: string;
  handleFavoriteChange?: (bookmarkId: string) => void;
};

const ProjectCard = ({
  item,
  isFavorite,
  favoriteId,
  handleFavoriteChange,
}: ProjectCardProps) => {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const query = useQueryParams();

  const averageLandSharePyeong = () => {
    if (+item.projectAreaM2 === 0 || +item.ownerCount === 0) {
      return '-';
    }
    return ((+item.projectAreaM2 / +item.ownerCount) * 0.3025).toFixed(2);
  };

  const handleCardClick = () => {
    const qs = new URLSearchParams({
      ...query,
      type: item.dataType,
    }).toString();
    router.push(`/${item.id}?${qs}`);
  };

  const str = item.address.split(' ');
  const sido = str[0];
  const gugun = str[1];
  const dong = str[2];
  const locationDetail = str[3];

  useEffect(() => {
    if (!mapRef.current || !item.address) return;

    let mounted = true;
    let pollId: NodeJS.Timeout | null = null;

    const initMap = () => {
      const kakao = (window as any).kakao;
      if (!kakao || !kakao.maps) return false;

      kakao.maps.load(() => {
        if (!mounted || !mapRef.current) return;

        mapRef.current.innerHTML = '';

        const defaultCenter = new kakao.maps.LatLng(37.5665, 126.978);
        const map = new kakao.maps.Map(mapRef.current, {
          center: defaultCenter,
          level: 5,
        });

        map.setDraggable(false);
        map.setZoomable(false);

        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.addressSearch(
          item.address,
          (result: any[], status: string) => {
            if (
              !mounted ||
              status !== kakao.maps.services.Status.OK ||
              !result?.length
            ) {
              return;
            }

            const { x, y } = result[0];
            const coords = new kakao.maps.LatLng(y, x);

            map.setCenter(coords);
            new kakao.maps.Marker({ map, position: coords });
          }
        );
      });

      return true;
    };

    if (!initMap()) {
      pollId = setInterval(() => {
        if (initMap() && pollId) {
          clearInterval(pollId);
        }
      }, 300);
    }

    return () => {
      mounted = false;
      if (pollId) clearInterval(pollId);
    };
  }, [item.address]);

  return (
    <Card
      className="relative flex flex-col overflow-hidden bg-transparent p-0 rounded-4xl aspect-390/230 min-w-[390px] max-w-[500px] mx-auto justify-between cursor-pointer"
      onClick={handleCardClick}
    >
      <div ref={mapRef} className="absolute inset-0 -z-10" />
      <CardHeader className="relative flex flex-row p-0 justify-between pt-4 px-4">
        {item.dataType === 'PUBLIC_DATA' && (
          <>
            <div className="pointer-events-none absolute inset-0 backdrop-blur-xs -z-10" />
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold">{item.address}</p>
              <h3 className="text-lg font-bold truncate w-40">
                {item.projectName}
              </h3>
            </div>
          </>
        )}

        {item.currentStage ? (
          <Badge className="text-xs font-bold bg-[#F4FF92] text-black h-fit">
            {item.currentStage}
          </Badge>
        ) : (
          <Badge className="text-xs font-bold bg-[#000DFF] text-white h-fit absolute right-4">
            예정지
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex flex-row justify-between items-center px-4 flex-1">
        <div className="bg-black text-white flex flex-col text-center text-lg rounded-3xl py-2 px-1.5">
          <div className="flex flex-row items-center">
            <p className="font-playfair">
              {item.renovationPrice?.minPrice ?? item.minPrice ?? '0'}
            </p>
            <span className="text-sm">억</span>
          </div>
          <p className="p-0 m-0 font-playfair leading-none text-sm">~</p>
          <div className="flex flex-row items-center">
            <p className="font-playfair">
              {item.renovationPrice?.maxPrice ?? item.maxPrice ?? '0'}
            </p>
            <span className="text-sm">억</span>
          </div>
        </div>
        <div className="relative flex flex-col border-2 border-black rounded-2xl p-1.5 text-right gap-1 overflow-hidden h-fit">
          <div className="pointer-events-none absolute inset-0 backdrop-blur-xs -z-10" />
          <p className="text-sm font-bold">{item.projectType || '-'}</p>
          <div className="font-bold">
            <p className="text-xs">평균대지지분</p>
            <p className="text-sm">{averageLandSharePyeong() || '-'} 평</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="relative flex flex-row justify-between px-4 pb-4">
        <div className="pointer-events-none absolute inset-0 backdrop-blur-xs -z-10" />
        {item.dataType === 'PUBLIC_DATA' ? (
          <>
            <div className="flex flex-col gap-1 font-bold">
              <p className="text-lg">
                {item.newConstructionUnits || '-'} 신축세대
              </p>
              <p className="text-xs">임대 {item.rentalUnits || '-'}</p>
            </div>
            <Bookmark
              item={item}
              bookmarkId={favoriteId}
              isFavorite={isFavorite}
              handleFavoriteChange={handleFavoriteChange}
            />
            <div className="flex flex-col text-xs text-gray-700 text-right">
              <p>
                소유자 수{' '}
                <span className="font-bold">{item.ownerCount || '-'}명</span>
              </p>
              <p className="font-bold">{item.projectAreaM2 || '-'}m2</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1 font-bold">
              <p className="text-sm">{gugun}</p>
              <p className="text-xs">{item.projectName}</p>
              <p className="text-xs">{`${dong} ${locationDetail}`}</p>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Bookmark
                item={item}
                bookmarkId={favoriteId}
                isFavorite={isFavorite}
                handleFavoriteChange={handleFavoriteChange}
              />
            </div>
            <div className="flex flex-col">
              <p className="text-xs text-black text-right">예정지</p>
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
