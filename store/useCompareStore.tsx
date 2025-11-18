import { create } from 'zustand';

type CompareStore = {
  compare: [string, string];
  setCompare: (id: string) => void;
};

const useCompareStore = create<CompareStore>((set) => ({
  compare: ['0', '0'],
  setCompare: (id) => set(() => ({compare : })),
}));

export default useCompareStore;
