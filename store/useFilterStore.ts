import { create } from 'zustand';

type PriceRange = {
  minPrice: number | null; // 원 단위
  maxPrice: number | null; // 원 단위
};

type OwnerRange = {
  ownerCountMin: number | null;
  ownerCountMax: number | null;
};

type NewUnitsRange = {
  newConstructionUnitsMin: number | null;
  newConstructionUnitsMax: number | null;
};

type FilterState = {
  locations: string[]; // ex) ['강남구', '수원시']
  projectTypes: string[]; // ex) ['재건축', '재개발']
  currentStage: string;
  price: PriceRange;
  ownerCount: OwnerRange;
  newUnits: NewUnitsRange;
  keyword: string;
  page: number;
  setLocations: (locations: string[]) => void;
  setProjectTypes: (types: string[]) => void;
  setCurrentStage: (stage: string) => void;
  setPrice: (range: PriceRange | ((prev: PriceRange) => PriceRange)) => void;
  setOwnerCount: (range: OwnerRange | ((prev: OwnerRange) => OwnerRange)) => void;
  setNewUnits: (range: NewUnitsRange | ((prev: NewUnitsRange) => NewUnitsRange)) => void;
  setKeyword: (keyword: string) => void;
  setPage: (page: number) => void;
  reset: () => void;
};

const initialPrice: PriceRange = { minPrice: null, maxPrice: null };
const initialOwner: OwnerRange = { ownerCountMin: null, ownerCountMax: null };
const initialUnits: NewUnitsRange = {
  newConstructionUnitsMin: null,
  newConstructionUnitsMax: null,
};

const initialState = {
  locations: [] as string[],
  projectTypes: [] as string[],
  currentStage: '',
  price: initialPrice,
  ownerCount: initialOwner,
  newUnits: initialUnits,
  keyword: '',
  page: 1,
};

const useFilterStore = create<FilterState>((set) => ({
  ...initialState,
  setLocations: (locations) => set({ locations }),
  setProjectTypes: (types) => set({ projectTypes: types }),
  setCurrentStage: (stage) => set({ currentStage: stage }),
  setPrice: (range) =>
    set((state) => ({
      price: typeof range === 'function' ? range(state.price) : range,
    })),
  setOwnerCount: (range) =>
    set((state) => ({
      ownerCount: typeof range === 'function' ? range(state.ownerCount) : range,
    })),
  setNewUnits: (range) =>
    set((state) => ({
      newUnits: typeof range === 'function' ? range(state.newUnits) : range,
    })),
  setKeyword: (keyword) => set({ keyword }),
  setPage: (page) => set({ page }),
  reset: () => set({ ...initialState }),
}));

export default useFilterStore;
