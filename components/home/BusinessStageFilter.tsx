'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import useFilterStore from '@/store/useFilterStore';
import { useSearchParams } from 'next/navigation';
import { useHandleFilter } from '@/lib/useHandleFilter';

const BUSINESS_STAGES = [
  '공식승인 전 단계',
  '정비구역지정',
  '추진위원회',
  '조합설립',
  '사업시행인가',
  '관리처분인가',
  '철거 / 착공',
];

export default function BusinessStageFilter() {
  const { currentStage: selectedStage, setCurrentStage } = useFilterStore();
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
    setCurrentStage(params.get('currentStage') ?? '');
  }, [searchParams, setCurrentStage]);

  const handleStageSelect = (stage: string) => {
    handleFilter({ data: stage, filter: 'currentStage' });
    setCurrentStage(stage);
    setIsOpen(false);
  };

  const handleReset = () => {
    setCurrentStage('');
    setIsOpen(false);
  };

  const getDisplayText = () => {
    return selectedStage || '사업단계';
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
              {BUSINESS_STAGES.map((stage) => (
                <button
                  key={stage}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedStage === stage
                      ? 'bg-green-100 text-green-600 border border-green-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleStageSelect(stage)}
                >
                  {stage}
                </button>
              ))}
            </div>

            {selectedStage && (
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
