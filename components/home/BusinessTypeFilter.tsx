'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import useFilterStore from '@/store/useFilterStore';
import { useSearchParams } from 'next/navigation';
import { useHandleFilter } from '@/lib/useHandleFilter';

const BUSINESS_TYPES = [
  '재건축',
  '재개발',
  '리모델링',
  '재정비촉진구역',
  '지역주택',
  '가로주택정비',
];

export default function BusinessTypeFilter() {
  const { projectTypes, setProjectTypes } = useFilterStore();
  const searchParams = useSearchParams();
  const selectedType = projectTypes[0] || '';
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [selectAll, setSelectAll] = useState(false);
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
    const types = params.getAll('projectTypes');
    setProjectTypes(types);
  }, [searchParams, setProjectTypes]);

  const handleTypeSelect = (type: string) => {
    setSelectAll(false);
    setProjectTypes([type]);
    handleFilter({ data: [type], filter: 'projectTypes' });
    setIsOpen(false);
  };

  const handleSelectAll = () => {
    setProjectTypes([]);
    setSelectAll(true);
    handleFilter({ data: [], filter: 'projectTypes' });
    setIsOpen(false);
  };

  const getDisplayText = () => {
    return selectAll ? '전체' : selectedType || '사업성격';
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
            <div className="grid grid-cols-2 gap-2">
              {BUSINESS_TYPES.map((type) => (
                <button
                  key={type}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedType === type || selectAll === true
                      ? 'bg-blue-100 text-blue-600 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleTypeSelect(type)}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="border-t border-gray-100 my-3"></div>
            <button
              className="w-full text-center px-2 py-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-4xl"
              onClick={handleSelectAll}
            >
              전체
            </button>
          </div>
        </div>
      )}
    </>
  );
}
