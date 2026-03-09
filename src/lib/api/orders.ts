import { get, post } from "./client";
import type {
  OrderVO,
  BookTicketRequest,
  OrderQueryRequest,
  PageResult,
} from "@/types/api";
import { API_ENDPOINTS } from "@/lib/constants";

/**
 * Orders API
 */

/**
 * Book/purchase tickets
 * @param data Booking request
 * @returns Order number
 */
export async function bookTicket(
  data: BookTicketRequest
): Promise<string> {
  return post<string>(API_ENDPOINTS.BOOK_TICKET, data);
}

/**
 * Get user's orders
 * @param userId User ID
 * @param params Query parameters
 * @returns Paginated order list
 */
export async function getUserOrders(
  userId: number,
  params?: OrderQueryRequest
): Promise<PageResult<OrderVO>> {
  return get<PageResult<OrderVO>>(API_ENDPOINTS.USER_ORDERS(userId), {
    params,
  });
}

/**
 * Get order detail
 * @param id Order ID
 * @returns Order detail
 */
export async function getOrderDetail(id: number): Promise<OrderVO> {
  return get<OrderVO>(API_ENDPOINTS.ORDER_DETAIL(id));
}

/**
 * Cancel order
 * @param id Order ID
 * @returns void
 */
export async function cancelOrder(id: number): Promise<void> {
  return post<void>(`/api/orders/${id}/cancel`);
}

/**
 * Get all orders (Admin only)
 * @param params Query parameters
 * @returns Paginated order list
 */
export async function getAllOrders(
  params?: OrderQueryRequest
): Promise<PageResult<OrderVO>> {
  return get<PageResult<OrderVO>>(API_ENDPOINTS.ADMIN_ORDERS, { params });
}
