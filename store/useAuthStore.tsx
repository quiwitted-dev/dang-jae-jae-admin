import { create } from 'zustand';

type StoreState = {
  isLogin: boolean;
  setIsLogin: (state: boolean) => void;

  user: {
    id: number;
    name: string;
  };
  setUser: (data: { id: number; name: string }) => void;
};

const useAuthStore = create<StoreState>((set) => ({
  isLogin: false,
  setIsLogin: (state) => set(() => ({ isLogin: state })),

  user: {
    id: 0,
    name: '',
  },
  setUser: (data) => set(() => ({ user: data })),
}));

export default useAuthStore;
