import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getStock } from "@/lib/api/stock";
import { STOCK_POLLING_INTERVAL } from "@/lib/constants";

/**
 * Stock Entry Type
 */
type StockKey = `${number}_${number}`; // concertId_gradeId

interface StockEntry {
  concertId: number;
  gradeId: number;
  stock: number;
  lastUpdate: number;
}

/**
 * Stock Store Interface
 */
interface StockState {
  // State
  stocks: Map<StockKey, number>;
  isLoading: boolean;

  // Actions
  setStock: (concertId: number, gradeId: number, stock: number) => void;
  getStock: (concertId: number, gradeId: number) => number | undefined;
  batchSetStocks: (entries: Array<{ concertId: number; gradeId: number; stock: number }>) => void;
  clearStocks: () => void;
  startPolling: (concertId: number, gradeIds: number[]) => () => void;
  stopPolling: () => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Stock Store with real-time updates
 */
export const useStockStore = create<StockState>()(
  devtools(
    (set, get) => ({
      // Initial state
      stocks: new Map(),
      isLoading: false,

      // Actions
      setStock: (concertId, gradeId, stock) => {
        const key: StockKey = `${concertId}_${gradeId}`;
        const stocks = new Map(get().stocks);
        stocks.set(key, stock);
        set({ stocks });
      },

      getStock: (concertId, gradeId) => {
        const key: StockKey = `${concertId}_${gradeId}`;
        return get().stocks.get(key);
      },

      batchSetStocks: (entries) => {
        const stocks = new Map(get().stocks);
        entries.forEach(({ concertId, gradeId, stock }) => {
          const key: StockKey = `${concertId}_${gradeId}`;
          stocks.set(key, stock);
        });
        set({ stocks });
      },

      clearStocks: () => {
        set({ stocks: new Map() });
      },

      setLoading: (isLoading) => set({ isLoading }),

      // Start polling stock updates
      startPolling: (concertId, gradeIds) => {
        // Initial fetch
        gradeIds.forEach(async (gradeId) => {
          try {
            const stock = await getStock(concertId, gradeId);
            get().setStock(concertId, gradeId, stock);
          } catch (error) {
            console.error(`Failed to fetch stock for ${concertId}_${gradeId}:`, error);
          }
        });

        // Set up polling interval
        const intervalId = setInterval(async () => {
          gradeIds.forEach(async (gradeId) => {
            try {
              const stock = await getStock(concertId, gradeId);
              get().setStock(concertId, gradeId, stock);
            } catch (error) {
              console.error(`Failed to fetch stock for ${concertId}_${gradeId}:`, error);
            }
          });
        }, STOCK_POLLING_INTERVAL);

        // Return cleanup function
        return () => {
          clearInterval(intervalId);
        };
      },

      stopPolling: () => {
        // Polling is stopped by calling the cleanup function returned from startPolling
      },
    }),
    { name: "stock-store" }
  )
);

/**
 * Stock hooks
 */
export const useStock = (concertId: number, gradeId: number) => {
  const stock = useStockStore((state) => state.getStock(concertId, gradeId));
  const isLoading = useStockStore((state) => state.isLoading);

  return {
    stock: stock ?? 0,
    isLoading,
    isAvailable: (stock ?? 0) > 0,
    isLowStock: (stock ?? 0) > 0 && (stock ?? 0) <= 10,
  };
};

export const useStocks = () => {
  const { setStock, batchSetStocks, startPolling, clearStocks } =
    useStockStore();

  return {
    setStock,
    batchSetStocks,
    startPolling,
    clearStocks,
  };
};
