'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dropdown, useDropdown } from '@/components/ui/dropdown';
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
  const dropdown = useDropdown();
  const handleFilter = useHandleFilter();

  useEffect(() => {
    if (!searchParams) return;
    const params = new URLSearchParams(searchParams.toString());
    setCurrentStage(params.get('currentStage') ?? '');
  }, [searchParams, setCurrentStage]);

  const handleStageSelect = (stage: string) => {
    handleFilter({ data: stage, filter: 'currentStage' });
    setCurrentStage(stage);
    dropdown.close();
  };

  const handleReset = () => {
    setCurrentStage('');
    handleFilter({ data: null, filter: 'currentStage' });
    dropdown.close();
  };

  const getDisplayText = () => {
    return selectedStage || '사업단계';
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
    </Dropdown>
  );
}
