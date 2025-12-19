'use client';

import { useEffect, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dropdown, useDropdown } from '@/components/ui/dropdown';
import useFilterStore from '@/store/useFilterStore';
import { useSearchParams } from 'next/navigation';
import { useHandleFilter } from '@/lib/useHandleFilter';

const NEW_UNITS_OPTIONS = [
  { value: 100, label: '~100세대' },
  { value: 300, label: '300세대' },
  { value: 500, label: '500세대' },
  { value: 1000, label: '1000세대' },
  { value: 3000, label: '3000세대' },
  { value: 5000, label: '5000세대~' },
];

export default function NewUnitsFilter() {
  const { newUnits: selectedRange, setNewUnits } = useFilterStore();
  const [displayUnits, setDisplayUnits] = useState<{
    newConstructionUnitsMin: number | null;
    newConstructionUnitsMax: number | null;
  }>({ newConstructionUnitsMin: null, newConstructionUnitsMax: null });
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
    setNewUnits({
      newConstructionUnitsMin: toNumberOrNull(
        params.get('newConstructionUnitsMin')
      ),
      newConstructionUnitsMax: toNumberOrNull(
        params.get('newConstructionUnitsMax')
      ),
    });
    setDisplayUnits({
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
        const { newConstructionUnitsMin, newConstructionUnitsMax } = prevRange;

        if (newConstructionUnitsMin && !newConstructionUnitsMax) {
          if (units > newConstructionUnitsMin) {
            setDisplayUnits({
              newConstructionUnitsMin,
              newConstructionUnitsMax: units,
            });
            return { newConstructionUnitsMin, newConstructionUnitsMax: units };
          } else if (units === newConstructionUnitsMin) {
            setDisplayUnits({
              newConstructionUnitsMin,
              newConstructionUnitsMax: null,
            });
            return { newConstructionUnitsMin, newConstructionUnitsMax: null };
          } else {
            setDisplayUnits({
              newConstructionUnitsMin: units,
              newConstructionUnitsMax: newConstructionUnitsMin,
            });
            return {
              newConstructionUnitsMin: units,
              newConstructionUnitsMax: newConstructionUnitsMin,
            };
          }
        } else if (newConstructionUnitsMin && newConstructionUnitsMax) {
          if (units > newConstructionUnitsMax) {
            setDisplayUnits({
              newConstructionUnitsMin,
              newConstructionUnitsMax: units,
            });
            return { newConstructionUnitsMin, newConstructionUnitsMax: units };
          } else if (
            units < newConstructionUnitsMax &&
            units > newConstructionUnitsMin
          ) {
            setDisplayUnits({
              newConstructionUnitsMin,
              newConstructionUnitsMax: units,
            });
            return { newConstructionUnitsMin, newConstructionUnitsMax: units };
          } else if (
            units === newConstructionUnitsMin ||
            units === newConstructionUnitsMax
          ) {
            setDisplayUnits({
              newConstructionUnitsMin: units,
              newConstructionUnitsMax: null,
            });
            return {
              newConstructionUnitsMin: units,
              newConstructionUnitsMax: null,
            };
          } else {
            setDisplayUnits({
              newConstructionUnitsMin: units,
              newConstructionUnitsMax: newConstructionUnitsMin,
            });
            return {
              newConstructionUnitsMin: units,
              newConstructionUnitsMax: newConstructionUnitsMin,
            };
          }
        } else {
          setDisplayUnits({
            newConstructionUnitsMin: units,
            newConstructionUnitsMax: null,
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

  const handleSubmit = () => {
    if (
      selectedRange.newConstructionUnitsMin === null &&
      selectedRange.newConstructionUnitsMax === null
    ) {
      return handleReset();
    }
    if (!selectedRange.newConstructionUnitsMax) {
      if (selectedRange.newConstructionUnitsMin === 5000) {
        dropdown.close();
        return handleFilter({
          data: {
            newConstructionUnitsMin: selectedRange.newConstructionUnitsMin,
            newConstructionUnitsMax: null,
          },
          filter: 'newConstructionUnits',
        });
      }
      handleFilter({
        filter: 'newConstructionUnits',
        data: {
          newConstructionUnitsMin: 0,
          newConstructionUnitsMax: selectedRange.newConstructionUnitsMin,
        },
      });
    } else if (selectedRange.newConstructionUnitsMax === 5000) {
      handleFilter({
        data: {
          newConstructionUnitsMin: selectedRange.newConstructionUnitsMin,
          newConstructionUnitsMax: null,
        },
        filter: 'newConstructionUnits',
      });
    } else {
      handleFilter({
        data: {
          newConstructionUnitsMin: selectedRange.newConstructionUnitsMin,
          newConstructionUnitsMax: selectedRange.newConstructionUnitsMax,
        },
        filter: 'newConstructionUnits',
      });
    }
    dropdown.close();
  };

  const handleReset = () => {
    setNewUnits({
      newConstructionUnitsMin: null,
      newConstructionUnitsMax: null,
    });
    setDisplayUnits({
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
    dropdown.close();
  };

  const getDisplayText = () => {
    const { newConstructionUnitsMin, newConstructionUnitsMax } = displayUnits;

    if (dropdown.isOpen) {
      if (newConstructionUnitsMin && !newConstructionUnitsMax) {
        if (newConstructionUnitsMin === 5000) {
          return `${newConstructionUnitsMin}명 이상`;
        }
        return `${newConstructionUnitsMin}세대 이하`;
      }
    } else {
      if (newConstructionUnitsMin && !newConstructionUnitsMax) {
        return `${newConstructionUnitsMin}세대 이상`;
      }
    }
    if (!newConstructionUnitsMin && newConstructionUnitsMax) {
      return `${newConstructionUnitsMax}세대 이하`;
    }
    if (newConstructionUnitsMin && newConstructionUnitsMax) {
      if (newConstructionUnitsMax === 5000) {
        return `${newConstructionUnitsMin}세대 이상`;
      }
      return `${newConstructionUnitsMin}세대 ~ ${newConstructionUnitsMax}세대`;
    }
    return '신축세대수';
  };

  const isInRange = (units: number) => {
    const { newConstructionUnitsMin: min, newConstructionUnitsMax: max } =
      displayUnits;
    if (!min) return false;
    if (!max) return units === min;
    return units >= min && units <= max;
  };

  const isRangeEndpoint = (units: number) => {
    const { newConstructionUnitsMin: min, newConstructionUnitsMax: max } =
      displayUnits;
    return units === min || units === max;
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
