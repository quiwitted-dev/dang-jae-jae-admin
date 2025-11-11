import { create } from 'zustand';

interface StoreState {
  isOpen: boolean;
  toggleOpen: () => void;

  myPageTab: 'message' | 'assetManagement' | 'settings' | 'none';
  setMyPageTab: (tab: 'message' | 'assetManagement' | 'settings') => void;

  settingsTab: 'privacy' | 'policies' | 'analysis' | 'service';
  setSettingsTab: (
    tab: 'privacy' | 'policies' | 'analysis' | 'service'
  ) => void;
}

const useStore = create<StoreState>((set) => ({
  isOpen: false,
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

  myPageTab: 'none',
  setMyPageTab: (tab) => set({ myPageTab: tab }),

  settingsTab: 'privacy',
  setSettingsTab: (tab) => set({ settingsTab: tab }),
}));

export default useStore;
