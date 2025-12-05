'use client';

import useFilterStore from '@/store/useFilterStore';
import { useRouter, useSearchParams } from 'next/navigation';

type PriceRange = { minPrice: number | null; maxPrice: number | null };
type OwnerCountRange = {
  ownerCountMin: number | null;
  ownerCountMax: number | null;
};
type newConstructionUnitRange = {
  newConstructionUnitsMin: number | null;
  newConstructionUnitsMax: number | null;
};

type Parameter =
  | { filter: 'locations'; data: string | string[] }
  | { filter: 'projectTypes'; data: string | string[] }
  | { filter: 'currentStage'; data: string }
  | { filter: 'price'; data: PriceRange }
  | { filter: 'ownerCount'; data: OwnerCountRange }
  | { filter: 'newConstructionUnits'; data: newConstructionUnitRange };

export const useHandleFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locations, projectTypes, currentStage, price, ownerCount, newUnits } =
    useFilterStore();

  return ({ data, filter }: Parameter) => {
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
      type.forEach((typ) => params.append('projectTypes', typ));
    } else {
      projectTypes.forEach((typ) => params.append('projectTypes', typ));
    }

    if (filter === 'currentStage') {
      setParam('currentStage', data as string);
    } else {
      setParam('currentStage', currentStage);
    }

    if (filter === 'price') {
      setParam('minPrice', data.minPrice);
      setParam('maxPrice', data.maxPrice);
    } else {
      setParam('minPrice', price.minPrice);
      setParam('maxPrice', price.maxPrice);
    }

    if (filter === 'ownerCount') {
      setParam('ownerCountMin', data.ownerCountMin);
      setParam('ownerCountMax', data.ownerCountMax);
    } else {
      setParam('ownerCountMin', ownerCount.ownerCountMin);
      setParam('ownerCountMax', ownerCount.ownerCountMax);
    }

    if (filter === 'newConstructionUnits') {
      setParam('newConstructionUnitsMin', data.newConstructionUnitsMin);
      setParam('newConstructionUnitsMax', data.newConstructionUnitsMax);
    } else {
      setParam('newConstructionUnitsMin', newUnits.newConstructionUnitsMin);
      setParam('newConstructionUnitsMax', newUnits.newConstructionUnitsMax);
    }

    params.set('page', '1');

    const query = params.toString();
    router.push(query ? `?${query}` : '?', { scroll: false });
  };
};
