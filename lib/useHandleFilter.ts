'use client';

import useFilterStore from '@/store/useFilterStore';
import { useRouter, useSearchParams } from 'next/navigation';

type parameter = {
  data: string | string[];
  filter:
    | 'locations'
    | 'projectTypes'
    | 'currentStage'
    | 'price'
    | 'ownerCount'
    | 'newConstructionUnits';
};

export const useHandleFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locations, projectTypes, currentStage, price, ownerCount, newUnits } =
    useFilterStore();

  return ({ data, filter }: parameter) => {
    const params = new URLSearchParams(searchParams?.toString());

    const setParam = (key: string, value?: string | number | null) => {
      if (value === undefined || value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    };

    params.delete('locations');
    if (filter === 'locations') {
      const locs = Array.isArray(data) ? data : [data];
      locs.forEach((loc) => params.append('locations', loc));
    } else {
      locations.forEach((loc) => params.append('locations', loc));
    }

    params.delete('projectTypes');
    if (filter === 'projectTypes') {
      const type = Array.isArray(data) ? data : [data];
      type.forEach((loc) => params.append('projectTypes', loc));
    } else {
      locations.forEach((loc) => params.append('projectTypes', loc));
    }
    // projectTypes.forEach((type) => params.append('projectTypes', type));

    if (filter === 'currentStage') {
      setParam('currentStage', data as string);
    } else {
      setParam('currentStage', currentStage);
    }

    if (filter === 'price') {
      setParam('minPrice', data[0]);
      setParam('maxPrice', data[1]);
    } else {
      setParam('minPrice', price.minPrice);
      setParam('maxPrice', price.maxPrice);
    }

    setParam('ownerCountMin', ownerCount.ownerCountMin);
    setParam('ownerCountMax', ownerCount.ownerCountMax);
    setParam('newConstructionUnitsMin', newUnits.newConstructionUnitsMin);
    setParam('newConstructionUnitsMax', newUnits.newConstructionUnitsMax);
    params.set('page', '1');

    const query = params.toString();
    router.push(query ? `?${query}` : '?', { scroll: false });
  };
};
