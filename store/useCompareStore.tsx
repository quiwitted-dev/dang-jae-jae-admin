import { create } from 'zustand';

export type CompareItem = {
  id: string;
  dataType: 'PUBLIC_DATA' | 'SUBMISSION';
};

type CompareStore = {
  compare: [CompareItem | null, CompareItem | null];
  setCompare: (item: CompareItem, slot?: 0 | 1) => void; // 첫 슬롯 비면 채우고, 아니면 두 번째 교체
  removeCompare: (slot: 0 | 1) => void;
  clear: () => void;
};

const useCompareStore = create<CompareStore>((set) => ({
  compare: [null, null],
  setCompare: (item, slot) =>
    set(({ compare }) => {
      if (slot === 0 || slot === 1) {
        const next = [...compare] as [CompareItem | null, CompareItem | null];
        next[slot] = item;
        return { compare: next };
      }

      const [a, b] = compare;
      if (!a) return { compare: [item, b] };
      if (!b) return { compare: [a, item] };
      // 둘 다 찼으면 순환 교체
      return { compare: [b, item] };
    }),
  removeCompare: (slot) =>
    set(({ compare }) => {
      if (slot !== 0 && slot !== 1) return { compare };
      const next = [...compare] as [CompareItem | null, CompareItem | null];
      next[slot] = null;
      return { compare: next };
    }),
  clear: () => set({ compare: [null, null] }),
}));

export default useCompareStore;
