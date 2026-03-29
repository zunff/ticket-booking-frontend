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
 * 转换订单数据：后端价格单位是分，前端转换为元
 */
function transformOrder(order: OrderVO): OrderVO {
  return {
    ...order,
    totalPrice: order.totalPrice / 100,
  };
}

/**
 * Book/purchase tickets
 * @param data Booking request (quantity 默认为 1)
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
 * @param params Query parameters (注意使用 current 而不是 page)
 * @returns Paginated order list
 */
export async function getUserOrders(
  userId: number,
  params?: OrderQueryRequest
): Promise<PageResult<OrderVO>> {
  const response = await get<PageResult<OrderVO>>(API_ENDPOINTS.USER_ORDERS(userId), {
    params,
  });
  return {
    ...response,
    records: response.records.map(transformOrder),
  };
}

/**
 * Get order detail by order number
 * @param orderNo Order number
 * @returns Order detail
 */
export async function getOrderDetail(orderNo: string): Promise<OrderVO> {
  const order = await get<OrderVO>(API_ENDPOINTS.ORDER_DETAIL(orderNo));
  return transformOrder(order);
}

/**
 * Cancel order
 * @param orderNo Order number
 * @returns void
 */
export async function cancelOrder(orderNo: string): Promise<void> {
  return post<void>(`${API_ENDPOINTS.ORDER_DETAIL(orderNo)}/cancel`);
}

/**
 * Get all orders (Admin only)
 * @param params Query parameters (注意使用 current 而不是 page)
 * @returns Paginated order list
 */
export async function getAllOrders(
  params?: OrderQueryRequest
): Promise<PageResult<OrderVO>> {
  const response = await get<PageResult<OrderVO>>(API_ENDPOINTS.ADMIN_ORDERS, { params });
  return {
    ...response,
    records: response.records.map(transformOrder),
  };
}

/**
 * Get order detail by order number (Admin only)
 * @param orderNo Order number
 * @returns Order detail
 */
export async function getAdminOrderDetail(orderNo: string): Promise<OrderVO> {
  const order = await get<OrderVO>(API_ENDPOINTS.ADMIN_ORDER_DETAIL(orderNo));
  return transformOrder(order);
}

/**
 * Get orders by user ID (Admin only)
 * @param userId User ID
 * @returns Order list
 */
export async function getAdminUserOrders(userId: number): Promise<OrderVO[]> {
  const orders = await get<OrderVO[]>(API_ENDPOINTS.ADMIN_USER_ORDERS(userId));
  return orders.map(transformOrder);
}
