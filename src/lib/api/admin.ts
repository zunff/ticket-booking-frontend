import { get } from "./client";
import type {
  DashboardStats,
  SalesDataPoint,
  ConcertSalesStats,
  ConcertVO,
} from "@/types/api";
import { API_ENDPOINTS } from "@/lib/constants";

/**
 * Admin Dashboard API
 */

/**
 * Get dashboard statistics
 * @returns Dashboard stats
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  return get<DashboardStats>(API_ENDPOINTS.ADMIN_DASHBOARD);
}

/**
 * Get sales data for chart
 * @param days Number of days to retrieve
 * @returns Sales data points
 */
export async function getSalesData(days: number = 30): Promise<SalesDataPoint[]> {
  return get<SalesDataPoint[]>(`${API_ENDPOINTS.ADMIN_DASHBOARD_SALES}?days=${days}`);
}

/**
 * Get concert sales statistics
 * @returns Concert sales stats
 */
export async function getConcertSalesStats(): Promise<ConcertSalesStats[]> {
  return get<ConcertSalesStats[]>(API_ENDPOINTS.ADMIN_DASHBOARD_CONCERTS);
}

/**
 * Get all concerts (Admin only, no pagination)
 * @returns Concert list
 */
export async function getAllConcerts(): Promise<ConcertVO[]> {
  return get<ConcertVO[]>(API_ENDPOINTS.ADMIN_CONCERTS);
}
