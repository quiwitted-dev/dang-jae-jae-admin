'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';

const NEW_UNITS_OPTIONS = [
  { value: 100, label: '100세대' },
  { value: 300, label: '300세대' },
  { value: 500, label: '500세대' },
  { value: 1000, label: '1000세대' },
  { value: 3000, label: '3000세대' },
  { value: 5000, label: '5000세대' },
];

export default function NewUnitsFilter() {
  const [selectedRange, setSelectedRange] = useState<{
    min: number | null;
    max: number | null;
  }>({ min: null, max: null });
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

  const handleUnitsClick = useCallback((units: number) => {
    setSelectedRange((prevRange) => {
      const { min, max } = prevRange;

      if (!min && !max) {
        // 첫 번째 클릭: 시작점 설정
        return { min: units, max: null };
      } else if (min && !max) {
        // 두 번째 클릭: 범위 완성
        if (units >= min) {
          return { min, max: units };
        } else {
          return { min: units, max: min };
        }
      } else {
        // 이미 범위가 설정된 경우: 새로운 시작점으로 리셋
        return { min: units, max: null };
      }
    });
  }, []);

  const handleReset = () => {
    setSelectedRange({ min: null, max: null });
    setIsOpen(false);
  };

  const getDisplayText = () => {
    const { min, max } = selectedRange;
    if (!min && !max) return '신축세대수';
    if (min && max) return `${min}세대~${max}세대`;
    if (min) return `${min}세대 선택중...`;
    return '신축세대수';
  };

  const isInRange = (units: number) => {
    const { min, max } = selectedRange;
    if (!min) return false;
    if (!max) return units === min;
    return units >= min && units <= max;
  };

  const isRangeEndpoint = (units: number) => {
    const { min, max } = selectedRange;
    return units === min || units === max;
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
          className="fixed w-80 bg-white border border-gray-200 rounded-md shadow-lg z-[9999]"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <div className="p-4">
            <div className="mb-3">
              <p className="text-sm text-gray-600 text-center">
                {selectedRange.min && !selectedRange.max
                  ? '끝점을 선택하세요'
                  : '시작점을 클릭하고 끝점을 선택하세요'}
              </p>
            </div>

            {/* 세로 슬라이더 형태 */}
            <div className="flex flex-col space-y-1">
              {NEW_UNITS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isRangeEndpoint(option.value)
                      ? 'bg-green-600 text-white border-2 border-green-600'
                      : isInRange(option.value)
                      ? 'bg-green-100 text-green-700 border-2 border-green-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                  onClick={() => handleUnitsClick(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {(selectedRange.min || selectedRange.max) && (
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
