'use client';

import { useEffect, useRef } from 'react';

type MapViewProps = {
  address?: string;
};

const MapView = ({ address }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!address || !mapRef.current) return;

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
        geocoder.addressSearch(address, (result: any[], status: string) => {
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
  }, [address]);

  if (!address) return null;

  return (
    <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-xl" />
  );
};

export default MapView;
