import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getConcertStocks } from "@/lib/api/stock";
import { STOCK_POLLING_INTERVAL } from "@/lib/constants";

/**
 * Stock Entry Type
 */
type StockKey = `${number}_${number}`; // concertId_gradeId

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
  batchSetStocks: (concertId: number, stocks: Record<string, number>) => void;
  clearStocks: () => void;
  startPolling: (concertId: number) => () => void;
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

      batchSetStocks: (concertId, stocksMap) => {
        const stocks = new Map(get().stocks);
        Object.entries(stocksMap).forEach(([gradeId, stock]) => {
          const key: StockKey = `${concertId}_${gradeId}` as StockKey;
          stocks.set(key, stock);
        });
        set({ stocks });
      },

      clearStocks: () => {
        set({ stocks: new Map() });
      },

      setLoading: (isLoading) => set({ isLoading }),

      // Start polling stock updates - 使用批量接口获取所有票档库存
      startPolling: (concertId) => {
        const fetchStocks = async () => {
          try {
            const stocksMap = await getConcertStocks(concertId);
            get().batchSetStocks(concertId, stocksMap);
          } catch (error) {
            console.error(`Failed to fetch stocks for concert ${concertId}:`, error);
          }
        };

        // Initial fetch
        fetchStocks();

        // Set up polling interval
        const intervalId = setInterval(fetchStocks, STOCK_POLLING_INTERVAL);

        // Return cleanup function
        return () => {
          clearInterval(intervalId);
        };
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
