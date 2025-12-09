'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dropdown, useDropdown } from '@/components/ui/dropdown';
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
  const dropdown = useDropdown();
  const [selectAll, setSelectAll] = useState(false);
  const handleFilter = useHandleFilter();

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
    dropdown.close();
  };

  const handleSelectAll = () => {
    setProjectTypes([]);
    setSelectAll(true);
    handleFilter({ data: [], filter: 'projectTypes' });
    dropdown.close();
  };

  const getDisplayText = () => {
    return selectAll ? '전체' : selectedType || '사업성격';
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
    </Dropdown>
  );
}
