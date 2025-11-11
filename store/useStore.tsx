import { create } from 'zustand';

interface StoreState {
  isOpen: boolean;
  toggleOpen: () => void;
}

const useStore = create<StoreState>((set) => ({
  isOpen: false,
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
}));

export default useStore;
