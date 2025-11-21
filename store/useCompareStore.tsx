import { create } from 'zustand';

export type CompareItem = {
  id: string;
  dataType: 'PUBLIC' | 'SUBMISSON';
};

type CompareStore = {
  compare: [CompareItem | null, CompareItem | null];
  setCompare: (item: CompareItem) => void; // 첫 슬롯 비면 채우고, 아니면 두 번째 교체
  clear: () => void;
};

const useCompareStore = create<CompareStore>((set) => ({
  compare: [null, null],
  setCompare: (item) =>
    set(({ compare }) => {
      const [a, b] = compare;
      if (!a) return { compare: [item, b] };
      if (!b) return { compare: [a, item] };
      // 둘 다 찼으면 순환 교체
      return { compare: [b, item] };
    }),
  clear: () => set({ compare: [null, null] }),
}));

export default useCompareStore;
