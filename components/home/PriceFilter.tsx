'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import useFilterStore from '@/store/useFilterStore';
import { useSearchParams } from 'next/navigation';
import { useHandleFilter } from '@/lib/useHandleFilter';

const PRICE_OPTIONS = [
  { value: 1, label: '1억' },
  { value: 5, label: '5억' },
  { value: 10, label: '10억' },
  { value: 15, label: '15억' },
  { value: 20, label: '20억' },
  { value: 25, label: '25억' },
  { value: 30, label: '30억' },
  { value: 35, label: '35억' },
  { value: 40, label: '40억' },
  { value: 50, label: '50억' },
  { value: 60, label: '60억' },
];

export default function PriceFilter() {
  const { price: selectedRange, setPrice } = useFilterStore();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [range, setRagnge] = useState<'less' | 'more'>('less');
  const handleFilter = useHandleFilter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const updateDropdownPosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const dropdownWidth = 320; // w-80 = 20rem = 320px
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

  useEffect(() => {
    if (!searchParams) return;
    const params = new URLSearchParams(searchParams.toString());
    const toNumberOrNull = (value: string | null) => {
      if (value === null || value === '') return null;
      const num = Number(value);
      return Number.isFinite(num) ? num : null;
    };
    setPrice({
      minPrice: toNumberOrNull(params.get('minPrice')),
      maxPrice: toNumberOrNull(params.get('maxPrice')),
    });
  }, [searchParams, setPrice]);

  const handlePriceClick = useCallback(
    (price: number) => {
      const priceWon = price; // 억 단위를 원으로 변환
      setPrice((prevRange) => {
        const { minPrice, maxPrice } = prevRange;

        if (minPrice && !maxPrice) {
          if (priceWon > minPrice) {
            return { minPrice, maxPrice: priceWon };
          } else if (priceWon === minPrice) {
            return { minPrice, maxPrice: null };
          } else {
            return { minPrice: priceWon, maxPrice: minPrice };
          }
        } else if (minPrice && maxPrice) {
          if (priceWon > maxPrice) {
            return { minPrice, maxPrice: priceWon };
          } else if (priceWon < maxPrice && priceWon > minPrice) {
            return { minPrice, maxPrice: priceWon };
          } else if (priceWon === minPrice || priceWon === maxPrice) {
            return { minPrice: priceWon, maxPrice: null };
          } else {
            return { minPrice: priceWon, maxPrice: minPrice };
          }
        } else {
          return { minPrice: priceWon, maxPrice: null };
        }
      });
    },
    [setPrice]
  );

  const handleSubmit = () => {
    if (!selectedRange.maxPrice && range === 'less') {
      handleFilter({
        data: {
          minPrice: 0,
          maxPrice: selectedRange.minPrice,
        },
        filter: 'price',
      });
    } else if (!selectedRange.maxPrice && range === 'more') {
      handleFilter({
        data: {
          minPrice: selectedRange.minPrice,
          maxPrice: 60,
        },
        filter: 'price',
      });
    } else {
      handleFilter({
        data: {
          minPrice: selectedRange.minPrice,
          maxPrice: selectedRange.maxPrice,
        },
        filter: 'price',
      });
    }
    setIsOpen(false);
  };

  const handleReset = () => {
    setPrice({ minPrice: null, maxPrice: null });
    handleFilter({
      data: {
        minPrice: null,
        maxPrice: null,
      },
      filter: 'price',
    });
  };

  const getDisplayText = () => {
    const { minPrice: min, maxPrice: max } = selectedRange;
    const toEok = (won: number | null) => (won ? Math.round(won) : null);
    const minEok = toEok(min);
    const maxEok = toEok(max);
    if (!minEok && !maxEok) return '시세';
    if (minEok && maxEok) return `${minEok}억~${maxEok}억`;
    if (minEok) return `${minEok}억 선택중...`;
    return '시세';
  };

  const isInRange = (price: number) => {
    const { minPrice: min, maxPrice: max } = selectedRange;
    const priceWon = price;
    if (!min) return false;
    if (!max) return priceWon === min;
    return priceWon >= min && priceWon <= max;
  };

  const isRangeEndpoint = (price: number) => {
    const { minPrice: min, maxPrice: max } = selectedRange;
    const priceWon = price;
    return priceWon === min || priceWon === max;
  };

  return (
    <>
      <Button
        ref={buttonRef}
        variant="ghost"
        className={`flex items-center gap-2 rounded-full ${
          isOpen && 'bg-gray-100 text-black'
        }`}
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
          className="fixed w-80 bg-white border border-gray-200 rounded-md shadow-lg z-9999"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <div className="p-4">
            <div className="mb-3">
              <p className="text-sm text-gray-600 text-center">
                {selectedRange.minPrice && !selectedRange.maxPrice
                  ? '끝점을 선택하세요'
                  : '시작점을 클릭하고 끝점을 선택하세요'}
              </p>
            </div>

            {/* 세로 슬라이더 형태 */}
            <div className="grid grid-cols-2 gap-1 space-y-1">
              {PRICE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isRangeEndpoint(option.value)
                      ? 'bg-blue-600 text-white border-2 border-blue-600'
                      : isInRange(option.value)
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                  onClick={() => handlePriceClick(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Todo : 하나만 선택했을 때 이상 이하 나오게 하기 */}
            {selectedRange.maxPrice === null &&
              selectedRange.minPrice !== null && (
                <div className="border-t flex flex-row justify-around items-center border-gray-100 pt-3">
                  <div>
                    <input
                      type="radio"
                      name="priceRange"
                      id="less"
                      checked={range === 'less'}
                      onChange={() => setRagnge('less')}
                    />
                    <label
                      htmlFor="less"
                      className="text-black"
                      onChange={() => setRagnge('less')}
                    >
                      이하
                    </label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      name="priceRange"
                      id="more"
                      className=""
                      checked={range === 'more'}
                      onChange={() => setRagnge('more')}
                    />
                    <label
                      htmlFor="more"
                      className="text-black"
                      onChange={() => setRagnge('more')}
                    >
                      이상
                    </label>
                  </div>
                </div>
              )}

            <div className="border-t flex flex-row border-gray-100 my-3">
              <button
                className="w-1/2 text-center px-2 py-2 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                onClick={handleReset}
              >
                선택 초기화
              </button>
              <button
                className="w-1/2 text-center px-2 py-2 text-blue-600 hover:bg-red-50 rounded cursor-pointer"
                onClick={handleSubmit}
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
