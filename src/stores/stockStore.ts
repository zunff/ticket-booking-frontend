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
  pollingInstances: Map<number, { count: number; intervalId: number | null }>;

  // Actions
  setStock: (concertId: number, gradeId: number, stock: number) => void;
  getStock: (concertId: number, gradeId: number) => number | undefined;
  batchSetStocks: (concertId: number, stocks: Record<string, number>) => void;
  clearStocks: () => void;
  subscribePolling: (concertId: number) => () => void;
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
      pollingInstances: new Map(),

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

      // Subscribe to polling - 使用引用计数确保同一 concertId 只有一个轮询实例
      subscribePolling: (concertId) => {
        const pollingInstances = get().pollingInstances;
        const instance = pollingInstances.get(concertId);

        if (instance) {
          // 已存在轮询实例，增加引用计数
          pollingInstances.set(concertId, { ...instance, count: instance.count + 1 });
        } else {
          // 创建新的轮询实例
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
          const intervalId = window.setInterval(fetchStocks, STOCK_POLLING_INTERVAL);
          pollingInstances.set(concertId, { count: 1, intervalId });
        }

        // Return cleanup function
        return () => {
          const current = get().pollingInstances.get(concertId);
          if (current) {
            if (current.count <= 1) {
              // 最后一个订阅者，清除轮询
              if (current.intervalId) {
                clearInterval(current.intervalId);
              }
              get().pollingInstances.delete(concertId);
            } else {
              // 减少引用计数
              get().pollingInstances.set(concertId, { ...current, count: current.count - 1 });
            }
          }
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
  const { setStock, batchSetStocks, subscribePolling, clearStocks } =
    useStockStore();

  return {
    setStock,
    batchSetStocks,
    subscribePolling,
    clearStocks,
  };
};
