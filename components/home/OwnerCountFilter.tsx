'use client';

import { useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dropdown, useDropdown } from '@/components/ui/dropdown';
import useFilterStore from '@/store/useFilterStore';
import { useSearchParams } from 'next/navigation';
import { useHandleFilter } from '@/lib/useHandleFilter';

const OWNER_COUNT_OPTIONS = [
  { value: 100, label: '100명' },
  { value: 300, label: '300명' },
  { value: 500, label: '500명' },
  { value: 1000, label: '1000명' },
  { value: 3000, label: '3000명' },
  { value: 5000, label: '5000명' },
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
        const { ownerCountMin: min, ownerCountMax: max } = prevRange;

        if (min && !max) {
          if (count >= min) {
            dropdown.close();
            handleFilter({
              filter: 'ownerCount',
              data: { ownerCountMin: min, ownerCountMax: count },
            });
            return { ownerCountMin: min, ownerCountMax: count };
          } else {
            dropdown.close();
            handleFilter({
              filter: 'ownerCount',
              data: { ownerCountMin: count, ownerCountMax: min },
            });
            return { ownerCountMin: count, ownerCountMax: min };
          }
        } else {
          handleFilter({
            filter: 'ownerCount',
            data: { ownerCountMin: count, ownerCountMax: null },
          });
          return { ownerCountMin: count, ownerCountMax: null };
        }
      });
    },
    [setOwnerCount]
  );

  const handleReset = () => {
    setOwnerCount({ ownerCountMin: null, ownerCountMax: null });
    handleFilter({
      filter: 'ownerCount',
      data: { ownerCountMin: null, ownerCountMax: null },
    });
    dropdown.close();
  };

  const getDisplayText = () => {
    const { ownerCountMin: min, ownerCountMax: max } = selectedRange;
    if (!min && !max) return '권리자수';
    if (min && max) return `${min}명~${max}명`;
    if (min) return `${min}명 선택중...`;
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
        <div className="mb-3">
          <p className="text-sm text-gray-600 text-center">
            {selectedRange.ownerCountMin && !selectedRange.ownerCountMax
              ? '끝점을 선택하세요'
              : '시작점을 클릭하고 끝점을 선택하세요'}
          </p>
        </div>

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

        {(selectedRange.ownerCountMin || selectedRange.ownerCountMax) && (
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
    </Dropdown>
  );
}
