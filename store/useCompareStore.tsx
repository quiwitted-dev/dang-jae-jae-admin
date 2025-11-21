import { create } from 'zustand';

type CompareStore = {
  compare: [string | null, string | null];
  setCompare: (id: string) => void; // 첫 슬롯 비면 채우고, 아니면 두 번째 교체
  clear: () => void;
};

const useCompareStore = create<CompareStore>((set) => ({
  compare: [null, null],
  setCompare: (id) =>
    set(({ compare }) => {
      const [a, b] = compare;
      if (!a) return { compare: [id, b] };
      if (!b) return { compare: [a, id] };
      // 둘 다 찼으면 순환 교체
      return { compare: [b, id] };
    }),
  clear: () => set({ compare: [null, null] }),
}));

export default useCompareStore