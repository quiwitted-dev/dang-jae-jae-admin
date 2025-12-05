'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import useFilterStore from '@/store/useFilterStore';
import { useSearchParams } from 'next/navigation';
import { useHandleFilter } from '@/lib/useHandleFilter';

const NEW_UNITS_OPTIONS = [
  { value: 100, label: '100세대' },
  { value: 300, label: '300세대' },
  { value: 500, label: '500세대' },
  { value: 1000, label: '1000세대' },
  { value: 3000, label: '3000세대' },
  { value: 5000, label: '5000세대' },
];

export default function NewUnitsFilter() {
  const { newUnits: selectedRange, setNewUnits } = useFilterStore();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
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
    setNewUnits({
      newConstructionUnitsMin: toNumberOrNull(
        params.get('newConstructionUnitsMin')
      ),
      newConstructionUnitsMax: toNumberOrNull(
        params.get('newConstructionUnitsMax')
      ),
    });
  }, [searchParams, setNewUnits]);

  const handleUnitsClick = useCallback(
    (units: number) => {
      setNewUnits((prevRange) => {
        const { newConstructionUnitsMin: min, newConstructionUnitsMax: max } =
          prevRange;

        if (!min && !max) {
          handleFilter({
            filter: 'newConstructionUnits',
            data: {
              newConstructionUnitsMin: units,
              newConstructionUnitsMax: null,
            },
          });
          return {
            newConstructionUnitsMin: units,
            newConstructionUnitsMax: null,
          };
        } else if (min && !max) {
          if (units >= min) {
            setIsOpen(false);
            handleFilter({
              filter: 'newConstructionUnits',
              data: {
                newConstructionUnitsMin: min,
                newConstructionUnitsMax: units,
              },
            });
            return {
              newConstructionUnitsMin: min,
              newConstructionUnitsMax: units,
            };
          } else {
            setIsOpen(false);
            handleFilter({
              filter: 'newConstructionUnits',
              data: {
                newConstructionUnitsMin: units,
                newConstructionUnitsMax: min,
              },
            });
            return {
              newConstructionUnitsMin: units,
              newConstructionUnitsMax: min,
            };
          }
        } else {
          handleFilter({
            filter: 'newConstructionUnits',
            data: {
              newConstructionUnitsMin: units,
              newConstructionUnitsMax: null,
            },
          });
          return {
            newConstructionUnitsMin: units,
            newConstructionUnitsMax: null,
          };
        }
      });
    },
    [setNewUnits]
  );

  const handleReset = () => {
    setNewUnits({
      newConstructionUnitsMin: null,
      newConstructionUnitsMax: null,
    });
    handleFilter({
      filter: 'newConstructionUnits',
      data: {
        newConstructionUnitsMin: null,
        newConstructionUnitsMax: null,
      },
    });
    setIsOpen(false);
  };

  const getDisplayText = () => {
    const { newConstructionUnitsMin, newConstructionUnitsMax } = selectedRange;
    if (!newConstructionUnitsMin && !newConstructionUnitsMax)
      return '신축세대수';
    if (newConstructionUnitsMin && newConstructionUnitsMax)
      return `${newConstructionUnitsMin}세대~${newConstructionUnitsMax}세대`;
    if (newConstructionUnitsMin)
      return `${newConstructionUnitsMin}세대 선택중...`;
    return '신축세대수';
  };

  const isInRange = (units: number) => {
    const { newConstructionUnitsMin: min, newConstructionUnitsMax: max } =
      selectedRange;
    if (!min) return false;
    if (!max) return units === min;
    return units >= min && units <= max;
  };

  const isRangeEndpoint = (units: number) => {
    const { newConstructionUnitsMin: min, newConstructionUnitsMax: max } =
      selectedRange;
    return units === min || units === max;
  };

  return (
    <>
      <Button
        ref={buttonRef}
        variant="ghost"
        className={`flex items-center gap-2 rounded-4xl rounded-full ${
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
                {selectedRange.newConstructionUnitsMin &&
                !selectedRange.newConstructionUnitsMax
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

            {(selectedRange.newConstructionUnitsMin ||
              selectedRange.newConstructionUnitsMax) && (
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
