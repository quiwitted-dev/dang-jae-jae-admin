'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dropdown, useDropdown } from '@/components/ui/dropdown';
import useFilterStore from '@/store/useFilterStore';
import { useSearchParams } from 'next/navigation';
import { useHandleFilter } from '@/lib/useHandleFilter';

const PRICE_OPTIONS = [
  { value: 1, label: '~1억' },
  { value: 5, label: '5억' },
  { value: 10, label: '10억' },
  { value: 15, label: '15억' },
  { value: 20, label: '20억' },
  { value: 25, label: '25억' },
  { value: 30, label: '30억' },
  { value: 35, label: '35억' },
  { value: 40, label: '40억' },
  { value: 50, label: '50억' },
  { value: 60, label: '60억~' },
];

export default function PriceFilter() {
  const { price: selectedRange, setPrice } = useFilterStore();
  const searchParams = useSearchParams();
  const dropdown = useDropdown();
  const handleFilter = useHandleFilter();

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
    if (!selectedRange.maxPrice) {
      handleFilter({
        data: {
          minPrice: 0,
          maxPrice: selectedRange.minPrice,
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
    dropdown.close();
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
    const { minPrice, maxPrice } = selectedRange;
    if (!minPrice && maxPrice) {
      return `${maxPrice}억 이하`;
    }
    if (minPrice && maxPrice) {
      return `${minPrice}억 ~ ${maxPrice}억`;
    }
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
    <Dropdown
      isOpen={dropdown.isOpen}
      onClose={dropdown.close}
      className="w-80 sm:w-72"
      trigger={
        <Button
          variant="ghost"
          className={`flex items-center gap-2 rounded-full ${
            dropdown.isOpen && 'bg-gray-100 text-black'
          }`}
          onClick={dropdown.toggle}
        >
          <p className="text-xl font-bold">{getDisplayText()}</p>
          <svg
            className={`h-4 w-4 transition-transform ${
              dropdown.isOpen ? 'rotate-180' : ''
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
      }
    >
      <div className="p-4">
        <div className="mb-3">
          <p className="text-sm text-gray-600 text-center"></p>
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

        <div className="border-t flex flex-row border-gray-100 my-3">
          <button
            className="w-1/2 text-center px-2 py-2 text-red-600 hover:bg-red-50 rounded cursor-pointer"
            onClick={handleReset}
          >
            선택해제
          </button>
          <button
            className="w-1/2 text-center px-2 py-2 text-blue-600 hover:bg-red-50 rounded cursor-pointer"
            onClick={handleSubmit}
          >
            적용
          </button>
        </div>
      </div>
    </Dropdown>
  );
}
