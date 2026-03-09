import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ConcertVO, ConcertDetailVO } from "@/types/api";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * Concert Store Interface
 */
interface ConcertState {
  // State
  concerts: ConcertVO[];
  concertDetailCache: Map<number, ConcertDetailVO>;
  totalPages: number;
  total: number;
  currentPage: number;
  isLoading: boolean;

  // Actions
  setConcerts: (concerts: ConcertVO[]) => void;
  setConcertDetail: (concert: ConcertDetailVO) => void;
  getConcertDetailFromCache: (id: number) => ConcertDetailVO | undefined;
  clearConcertDetailCache: () => void;
  setPagination: (page: number, total: number, totalPages: number) => void;
  setLoading: (loading: boolean) => void;
  clearCache: () => void;
}

/**
 * Concert Store with caching
 */
export const useConcertStore = create<ConcertState>()(
  persist(
    (set, get) => ({
      // Initial state
      concerts: [],
      concertDetailCache: new Map(),
      totalPages: 1,
      total: 0,
      currentPage: 1,
      isLoading: false,

      // Actions
      setConcerts: (concerts) => set({ concerts }),

      setConcertDetail: (concert) => {
        const cache = get().concertDetailCache;
        cache.set(concert.id, concert);
        set({ concertDetailCache: new Map(cache) });
      },

      getConcertDetailFromCache: (id) => {
        return get().concertDetailCache.get(id);
      },

      clearConcertDetailCache: () => {
        set({ concertDetailCache: new Map() });
      },

      setPagination: (page, total, totalPages) => {
        set({ currentPage: page, total, totalPages });
      },

      setLoading: (isLoading) => set({ isLoading }),

      clearCache: () => {
        set({
          concerts: [],
          concertDetailCache: new Map(),
          totalPages: 1,
          total: 0,
          currentPage: 1,
        });
      },
    }),
    {
      name: "concert-storage",
      // Don't persist everything - just the concert list
      partialize: (state) => ({
        concerts: state.concerts,
      }),
    }
  )
);

/**
 * Concert hooks
 */
export const useConcerts = () => {
  const { concerts, totalPages, total, currentPage, isLoading } =
    useConcertStore();

  return {
    concerts,
    totalPages,
    total,
    currentPage,
    isLoading,
  };
};

export const useConcertCache = () => {
  const { concertDetailCache, getConcertDetailFromCache, setConcertDetail } =
    useConcertStore();

  return {
    concertDetailCache,
    getCachedConcert: getConcertDetailFromCache,
    cacheConcert: setConcertDetail,
  };
};
