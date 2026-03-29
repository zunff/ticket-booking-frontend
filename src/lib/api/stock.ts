import { get, post } from "./client";
import type {
  AdjustStockRequest,
  StockLogVO,
  StockLogQueryRequest,
  PageResult,
  ConcertStockResponse,
} from "@/types/api";
import { API_ENDPOINTS } from "@/lib/constants";

/**
 * Stock API
 */

/**
 * Get all stocks for a concert (批量获取演唱会所有票档库存)
 * 用于实时库存轮询
 * @param concertId Concert ID
 * @returns Map<gradeId, availableStock>
 */
export async function getConcertStocks(
  concertId: number
): Promise<ConcertStockResponse> {
  return get<ConcertStockResponse>(API_ENDPOINTS.CONCERT_STOCKS(concertId));
}

/**
 * Get stock logs for a specific grade
 * @param concertId Concert ID
 * @param gradeId Ticket grade ID
 * @returns Stock log list
 */
export async function getStockLogsByGrade(
  concertId: number,
  gradeId: number
): Promise<StockLogVO[]> {
  return get<StockLogVO[]>(API_ENDPOINTS.STOCK_LOGS_BY_GRADE(concertId, gradeId));
}

/**
 * Adjust stock (Admin only)
 * @param data Stock adjustment request
 * @returns Result message
 */
export async function adjustStock(data: AdjustStockRequest): Promise<string> {
  // 后端使用 query 参数
  const params = new URLSearchParams({
    concertId: data.concertId.toString(),
    gradeId: data.gradeId.toString(),
    newStock: data.newStock.toString(),
  });
  if (data.remark) {
    params.append("remark", data.remark);
  }
  return post<string>(`${API_ENDPOINTS.ADMIN_STOCK_ADJUST}?${params.toString()}`);
}

/**
 * Get stock adjustment logs (Admin only)
 * @param params Query parameters (注意使用 current 而不是 page)
 * @returns Paginated stock log list
 */
export async function getStockLogs(
  params?: StockLogQueryRequest
): Promise<PageResult<StockLogVO>> {
  return get<PageResult<StockLogVO>>(API_ENDPOINTS.ADMIN_STOCK_LOGS, { params });
}

/**
 * Get stock logs by concert and grade (Admin only)
 * @param concertId Concert ID
 * @param gradeId Ticket grade ID
 * @returns Stock log list
 */
export async function getAdminStockLogsByGrade(
  concertId: number,
  gradeId: number
): Promise<StockLogVO[]> {
  return get<StockLogVO[]>(API_ENDPOINTS.ADMIN_STOCK_LOGS_BY_GRADE(concertId, gradeId));
}
