'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import useFilterStore from '@/store/useFilterStore';
import { useSearchParams } from 'next/navigation';

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

        if (!min && !max) {
          return { ownerCountMin: count, ownerCountMax: null };
        } else if (min && !max) {
          if (count >= min) {
            setIsOpen(false);
            return { ownerCountMin: min, ownerCountMax: count };
          } else {
            setIsOpen(false);
            return { ownerCountMin: count, ownerCountMax: min };
          }
        } else {
          return { ownerCountMin: count, ownerCountMax: null };
        }
      });
    },
    [setOwnerCount]
  );

  const handleReset = () => {
    setOwnerCount({ ownerCountMin: null, ownerCountMax: null });
    setIsOpen(false);
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
        </div>
      )}
    </>
  );
}
