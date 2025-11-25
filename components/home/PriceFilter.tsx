'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import useFilterStore from '@/store/useFilterStore';
import { useSearchParams } from 'next/navigation';

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
      const priceWon = price * 100_000_000; // 억 단위를 원으로 변환
      setPrice((prevRange) => {
        const { minPrice, maxPrice } = prevRange;

        if (!minPrice && !maxPrice) {
          return { minPrice: priceWon, maxPrice: null };
        } else if (minPrice && !maxPrice) {
          if (priceWon >= minPrice) {
            setIsOpen(false);
            return { minPrice, maxPrice: priceWon };
          } else {
            setIsOpen(false);
            return { minPrice: priceWon, maxPrice: minPrice };
          }
        } else {
          return { minPrice: priceWon, maxPrice: null };
        }
      });
    },
    [setPrice]
  );

  const handleReset = () => {
    setPrice({ minPrice: null, maxPrice: null });
    setIsOpen(false);
  };

  const getDisplayText = () => {
    const { minPrice: min, maxPrice: max } = selectedRange;
    const toEok = (won: number | null) =>
      won ? Math.round(won / 100_000_000) : null;
    const minEok = toEok(min);
    const maxEok = toEok(max);
    if (!minEok && !maxEok) return '시세';
    if (minEok && maxEok) return `${minEok}억~${maxEok}억`;
    if (minEok) return `${minEok}억 선택중...`;
    return '시세';
  };

  const isInRange = (price: number) => {
    const { minPrice: min, maxPrice: max } = selectedRange;
    const priceWon = price * 100_000_000;
    if (!min) return false;
    if (!max) return priceWon === min;
    return priceWon >= min && priceWon <= max;
  };

  const isRangeEndpoint = (price: number) => {
    const { minPrice: min, maxPrice: max } = selectedRange;
    const priceWon = price * 100_000_000;
    return priceWon === min || priceWon === max;
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
            <div className="flex flex-col space-y-1">
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

            {(selectedRange.minPrice || selectedRange.maxPrice) && (
              <>
                <div className="border-t border-gray-100 my-3"></div>
                <button
                  className="w-full text-left px-2 py-2 text-red-600 hover:bg-red-50 rounded"
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
