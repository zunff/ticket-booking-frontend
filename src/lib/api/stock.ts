import { get, post } from "./client";
import type {
  AdjustStockRequest,
  StockLogVO,
  StockLogQueryRequest,
  PageResult,
} from "@/types/api";
import { API_ENDPOINTS } from "@/lib/constants";

/**
 * Stock API
 */

/**
 * Get available stock for a concert's ticket grade
 * @param concertId Concert ID
 * @param gradeId Ticket grade ID
 * @returns Available stock count
 */
export async function getStock(
  concertId: number,
  gradeId: number
): Promise<number> {
  // Backend returns Result<Integer>, so data is directly the stock number
  const response = await get<number>(
    API_ENDPOINTS.STOCK(concertId, gradeId)
  );
  return response;
}

/**
 * Adjust stock (Admin only)
 * @param data Stock adjustment request
 * @returns void
 */
export async function adjustStock(data: AdjustStockRequest): Promise<void> {
  return post<void>(API_ENDPOINTS.ADMIN_STOCK_ADJUST, data);
}

/**
 * Get stock adjustment logs (Admin only)
 * @param params Query parameters
 * @returns Paginated stock log list
 */
export async function getStockLogs(
  params?: StockLogQueryRequest
): Promise<PageResult<StockLogVO>> {
  return get<PageResult<StockLogVO>>(API_ENDPOINTS.ADMIN_STOCK_LOGS, {
    params,
  });
}
