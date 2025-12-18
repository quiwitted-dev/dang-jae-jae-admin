'use client';

import { useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dropdown, useDropdown } from '@/components/ui/dropdown';
import useFilterStore from '@/store/useFilterStore';
import { useSearchParams } from 'next/navigation';
import { useHandleFilter } from '@/lib/useHandleFilter';

const OWNER_COUNT_OPTIONS = [
  { value: 100, label: '~100명' },
  { value: 300, label: '300명' },
  { value: 500, label: '500명' },
  { value: 1000, label: '1000명' },
  { value: 3000, label: '3000명' },
  { value: 5000, label: '5000명~' },
];

export default function OwnerCountFilter() {
  const { ownerCount: selectedRange, setOwnerCount } = useFilterStore();
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
    setOwnerCount({
      ownerCountMin: toNumberOrNull(params.get('ownerCountMin')),
      ownerCountMax: toNumberOrNull(params.get('ownerCountMax')),
    });
  }, [searchParams, setOwnerCount]);

  const handleCountClick = useCallback(
    (count: number) => {
      setOwnerCount((prevRange) => {
        const { ownerCountMin, ownerCountMax } = prevRange;

        if (ownerCountMin && !ownerCountMax) {
          if (count > ownerCountMin) {
            return { ownerCountMin, ownerCountMax: count };
          } else if (count === ownerCountMin) {
            return { ownerCountMin, ownerCountMax: null };
          } else {
            return { ownerCountMin: count, ownerCountMax: ownerCountMin };
          }
        } else if (ownerCountMin && ownerCountMax) {
          if (count > ownerCountMax) {
            return { ownerCountMin, ownerCountMax: count };
          } else if (count < ownerCountMax && count > ownerCountMin) {
            return { ownerCountMin, ownerCountMax: count };
          } else if (count === ownerCountMin || count === ownerCountMax) {
            return { ownerCountMin: count, ownerCountMax: null };
          } else {
            return { ownerCountMin: count, ownerCountMax: ownerCountMin };
          }
        } else {
          return { ownerCountMin: count, ownerCountMax: null };
        }
      });
    },
    [setOwnerCount]
  );

  const handleSubmit = () => {
    if (
      selectedRange.ownerCountMin === null &&
      selectedRange.ownerCountMax === null
    ) {
      return handleReset();
    }
    if (!selectedRange.ownerCountMax) {
      if (selectedRange.ownerCountMin === 5000) {
        dropdown.close();
        return handleFilter({
          data: {
            ownerCountMin: selectedRange.ownerCountMin,
            ownerCountMax: null,
          },
          filter: 'ownerCount',
        });
      }
      handleFilter({
        filter: 'ownerCount',
        data: { ownerCountMin: 0, ownerCountMax: selectedRange.ownerCountMin },
      });
    } else {
      handleFilter({
        data: {
          ownerCountMin: selectedRange.ownerCountMin,
          ownerCountMax: selectedRange.ownerCountMax,
        },
        filter: 'ownerCount',
      });
    }
    dropdown.close();
  };

  const handleReset = () => {
    setOwnerCount({ ownerCountMin: null, ownerCountMax: null });
    handleFilter({
      filter: 'ownerCount',
      data: { ownerCountMin: null, ownerCountMax: null },
    });
    dropdown.close();
  };

  const getDisplayText = () => {
    const { ownerCountMin, ownerCountMax } = selectedRange;
    if (!ownerCountMin && ownerCountMax) {
      return `${ownerCountMax}명 이하`;
    }
    if (ownerCountMin === 5000) {
      return `${ownerCountMin}명 이상`;
    }
    if (ownerCountMin && ownerCountMax) {
      return `${ownerCountMin}명 ~ ${ownerCountMax}명`;
    }
    return '권리자수';
  };

  const isInRange = (count: number) => {
    const { ownerCountMin: min, ownerCountMax: max } = selectedRange;
    if (!min) return false;
    if (!max) return count === min;
    return count >= min && count <= max;
  };

  const isRangeEndpoint = (count: number) => {
    const { ownerCountMin: min, ownerCountMax: max } = selectedRange;
    return count === min || count === max;
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
        {/* 세로 슬라이더 형태 */}
        <div className="flex flex-col space-y-1">
          {OWNER_COUNT_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isRangeEndpoint(option.value)
                  ? 'bg-purple-600 text-white border-2 border-purple-600'
                  : isInRange(option.value)
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent'
              }`}
              onClick={() => handleCountClick(option.value)}
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
