import { create } from 'zustand';

interface StoreState {
  isOpen: boolean;
  toggleOpen: () => void;

  myPageTab: 'message' | 'assetManagement' | 'settings' | 'none';
  setMyPageTab: (tab: 'message' | 'assetManagement' | 'settings') => void;

  settingsTab: 'privacy' | 'policies' | 'analysis' | 'service' | 'none';
  setSettingsTab: (
    tab: 'privacy' | 'policies' | 'analysis' | 'service' | 'none'
  ) => void;

  address: string;
  setAddress: (address: string) => void;

  // isTermsModalOpen: boolean;
  // setIsTermsModalOpen: () => void;

  clear: () => void;
}

const useStore = create<StoreState>((set) => ({
  isOpen: false,
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

  myPageTab: 'none',
  setMyPageTab: (tab) => set({ myPageTab: tab }),

  settingsTab: 'privacy',
  setSettingsTab: (tab) => set({ settingsTab: tab }),

  address: '',
  setAddress: (address) => set({ address }),

  // isTermsModalOpen: false,
  // setIsTermsModalOpen: () =>
  //   set((state) => ({ isTermsModalOpen: !state.isTermsModalOpen })),

  clear: () => set({ myPageTab: 'none', settingsTab: 'none' }),
}));

export default useStore;
