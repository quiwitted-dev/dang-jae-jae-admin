'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import useFilterStore from '@/store/useFilterStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useHandleFilter } from '@/lib/useHandleFilter';

const LOCATION_DATA = {
  서울시: [
    '강남',
    '강동',
    '강북',
    '강서',
    '관악',
    '광진',
    '구로',
    '금천',
    '노원',
    '도봉',
    '동대문',
    '동작',
    '마포',
    '서대문',
    '서초',
    '성동',
    '성북',
    '송파',
    '양천',
    '영등포',
    '용산',
    '은평',
    '종로',
    '중구',
    '중랑',
  ],
  경기도: [
    '고양',
    '과천',
    '광명',
    '광주',
    '구리',
    '군포',
    '김포',
    '남양주',
    '동두천',
    '부천',
    '성남',
    '수원',
    '시흥',
    '안산',
    '안성',
    '안양',
    '양주',
    '여주',
    '오산',
    '용인',
    '의왕',
    '의정부',
    '이천',
    '파주',
    '평택',
    '포천',
    '하남',
    '화성',
  ],
};

export default function LocationFilter() {
  const {
    locations,
    projectTypes,
    currentStage,
    price,
    ownerCount,
    newUnits,
    setLocations,
  } = useFilterStore();
  const searchParams = useSearchParams();
  const [selectRegion, setSelectRegion] = useState({
    region: '',
    district: '',
  });
  const [isOpen, setIsOpen] = useState(false);
  const [showDistricts, setShowDistricts] = useState<string>('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const handleFilter = useHandleFilter();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowDistricts('');
      }
    };

    const updateDropdownPosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const dropdownWidth = 256; // w-64 = 16rem = 256px
        const viewportWidth = window.innerWidth;
        const padding = 16; // 여백

        let left = rect.left + window.scrollX;

        // 드롭다운이 화면 우측을 벗어나는 경우 위치 조정
        if (left + dropdownWidth > viewportWidth - padding) {
          left = viewportWidth - dropdownWidth - padding;
        }

        // 드롭다운이 화면 좌측을 벗어나는 경우 위치 조정
        if (left < padding) {
          left = padding;
        }

        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: left,
        });
        setIsPositioned(true);
      }
    };

    if (isOpen) {
      setIsPositioned(false);
      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition);
      window.addEventListener('resize', updateDropdownPosition);
    } else {
      setIsPositioned(false);
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updateDropdownPosition);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [isOpen]);

  const handleRegionSelect = (region: string) => {
    if (selectRegion.region === region) {
      // 같은 지역 클릭시 세부 지역 토글
      setShowDistricts(showDistricts === region ? '' : region);
    } else {
      setSelectRegion({
        region,
        district: '',
      });
      setShowDistricts(region);
    }
  };

  const handleDistrictSelect = (district: string) => {
    if (selectRegion.region === '서울시') {
      setLocations([`${district}구`]);
    } else {
      setLocations([`${district}시`]);
    }
    setSelectRegion((prev) => ({ ...prev, district }));
    setIsOpen(false);
    setShowDistricts('');
    handleFilter({ data: `${district}구`, filter: 'locations' });
  };

  const handleReset = () => {
    setLocations([]);
    setSelectRegion({ region: '', district: '' });
    handleFilter({ data: [], filter: 'locations' });
    setIsOpen(false);
    setShowDistricts('');
  };

  useEffect(() => {
    if (!searchParams) return;
    const params = new URLSearchParams(searchParams.toString());
    const locs = params.getAll('locations');
    if (!locs.length) {
      setLocations([]);
      setSelectRegion({ region: '', district: '' });
      return;
    }

    const first = locs[0];
    const isSeoul = first.endsWith('구');
    const district = isSeoul
      ? first.replace(/구$/, '')
      : first.replace(/시$/, '');
    setLocations(locs);
    setSelectRegion({
      region: isSeoul ? '서울시' : '경기도',
      district,
    });
  }, [searchParams, setLocations]);

  const getDisplayText = () => {
    if (selectRegion.district) {
      return `${selectRegion.region} ${selectRegion.district}`;
    }
    if (selectRegion.region) {
      return selectRegion.region;
    }
    return '위치';
  };

  return (
    <>
      <Button
        ref={buttonRef}
        variant="ghost"
        className="flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <p className="text-2xl font-bold">{getDisplayText()}</p>
        <svg
          className={`h-4 w-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>

      {isOpen && isPositioned && (
        <div
          ref={dropdownRef}
          className="fixed w-64 bg-white border border-gray-200 rounded-md shadow-lg z-9999"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <div className="py-1">
            {Object.entries(LOCATION_DATA).map(([region, districts]) => (
              <div key={region}>
                <button
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center text-black justify-between ${
                    selectRegion.region === region
                      ? 'bg-blue-50 text-blue-600'
                      : ''
                  }`}
                  onClick={() => handleRegionSelect(region)}
                >
                  <span className="font-medium">{region}</span>
                  <svg
                    className={`h-4 w-4 transition-transform ${
                      showDistricts === region ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showDistricts === region && (
                  <div className="bg-gray-50 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-1 p-2">
                      {districts.map((district) => (
                        <button
                          key={district}
                          className={`px-2 py-1 text-sm rounded text-black hover:bg-gray-200 ${
                            selectRegion.district === district
                              ? 'bg-blue-100 text-blue-600'
                              : ''
                          }`}
                          onClick={() => handleDistrictSelect(district)}
                        >
                          {district}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {(selectRegion.region || selectRegion.district) && (
              <>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                  onClick={handleReset}
                >
                  선택 초기화
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
