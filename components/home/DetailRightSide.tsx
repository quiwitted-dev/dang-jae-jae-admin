'use client';

import {
  SubmissionPublicDetail,
  SubmissionUserDetail,
} from '@/types/submission.type';
import { useEffect, useRef } from 'react';
import { Badge } from '../ui/badge';

type DetailRightSideProps =
  | {
      type: 'PUBLIC_DATA';
      publicData: SubmissionPublicDetail;
    }
  | { type: 'SUBMISSION'; publicData: SubmissionUserDetail };

const DetailRightSide = ({ type, publicData }: DetailRightSideProps) => {
  const address = () => {
    if (type === 'PUBLIC_DATA') {
      return publicData.dataSource === 'SEOUL'
        ? publicData.representativeLotNumber
        : publicData.address;
    }
    return publicData.location;
  };

  const businessType = () => {
    if (type === 'PUBLIC_DATA') {
      return publicData.dataSource === 'SEOUL'
        ? publicData.businessType
        : publicData.projectType;
    }
    return '예정지';
  };

  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!address() || !mapRef.current) return;
    let mounted = true;
    let pollId: NodeJS.Timeout | null = null;

    const initMap = () => {
      const kakao = (window as any).kakao;
      if (!kakao || !kakao.maps) return false;

      kakao.maps.load(() => {
        if (!mounted || !mapRef.current) return;

        mapRef.current.innerHTML = '';

        const defaultCenter = new kakao.maps.LatLng(37.5665, 126.978); // 서울 시청 좌표
        const map = new kakao.maps.Map(mapRef.current, {
          center: defaultCenter,
          level: 3,
        });

        map.setDraggable(false);
        map.setZoomable(false);

        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.addressSearch(address(), (result: any[], status: string) => {
          if (status !== kakao.maps.services.Status.OK || !result?.length) {
            return;
          }

          const { x, y } = result[0];
          const coords = new kakao.maps.LatLng(y, x);

          map.setCenter(coords);
          new kakao.maps.Marker({ map, position: coords });
        });
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
  }, [address()]);

  if (!address()) return null;

  return (
    <div className="relative w-full h-full">
      {/* map */}
      <div ref={mapRef} className="w-full h-full min-h-80" />

      {/* 하단 정보 */}
      <div className="md:hidden absolute flex flex-col bottom-0 left-0 w-full py-3 px-6 bg-transparent z-20 backdrop-blur-xs">
        <div className="flex flex-row justify-between items-center text-[14px]">
          <p className="text-black">
            <span>{address().split(' ')[1]}</span>{' '}
            <span className="font-medium">
              {address().split(' ').slice(2).join(' ')}
            </span>
          </p>
          {type === 'PUBLIC_DATA' && (
            <p className="text-black font-semibold">{businessType()}</p>
          )}
          {type === 'SUBMISSION' && (
            <Badge className="text-xs font-bold bg-[#000DFF] text-white h-fit absolute right-4 leading-relaxed">
              {businessType()}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
export default DetailRightSide;
