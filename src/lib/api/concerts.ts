import { get, post, put, del } from "./client";
import type {
  ConcertVO,
  ConcertDetailWithStockVO,
  ConcertRequest,
  ConcertQueryRequest,
  PageResult,
  TicketGradeVO,
  TicketGradeRequest,
} from "@/types/api";
import { API_ENDPOINTS } from "@/lib/constants";

/**
 * Concerts API
 */

/**
 * Get concert list with pagination (User)
 * @param params Query parameters (注意使用 current 而不是 page)
 * @returns Paginated concert list
 */
export async function getConcerts(
  params?: ConcertQueryRequest
): Promise<PageResult<ConcertVO>> {
  return get<PageResult<ConcertVO>>(API_ENDPOINTS.CONCERTS, { params });
}

/**
 * Get concert list with pagination (Admin)
 * @param params Query parameters (注意使用 current 而不是 page)
 * @returns Paginated concert list
 */
export async function getAdminConcerts(
  params?: ConcertQueryRequest
): Promise<PageResult<ConcertVO>> {
  return get<PageResult<ConcertVO>>(API_ENDPOINTS.ADMIN_CONCERTS, { params });
}

/**
 * Get concert detail by ID (包含实时库存信息)
 * @param id Concert ID
 * @returns Concert detail with stock info
 */
export async function getConcertDetail(
  id: number
): Promise<ConcertDetailWithStockVO> {
  const response = await get<ConcertDetailWithStockVO>(API_ENDPOINTS.CONCERT_DETAIL(id));
  // 后端返回 grades，前端统一使用 ticketGrades
  // 后端价格单位是分，前端统一转换为元
  return {
    ...response,
    ticketGrades: response.grades?.map((g) => ({
      ...g,
      price: g.price / 100,
    })) || [],
  };
}

/**
 * Get concert detail by ID (Admin)
 * @param id Concert ID
 * @returns Concert detail with stock info
 */
export async function getAdminConcertDetail(
  id: number
): Promise<ConcertDetailWithStockVO> {
  const response = await get<ConcertDetailWithStockVO>(API_ENDPOINTS.ADMIN_CONCERT_DETAIL(id));
  // 后端返回 grades，前端统一使用 ticketGrades
  // 后端价格单位是分，前端统一转换为元
  return {
    ...response,
    ticketGrades: response.grades?.map((g) => ({
      ...g,
      price: g.price / 100,
    })) || [],
  };
}

/**
 * Create new concert (Admin only)
 * @param data Concert data
 * @returns Created concert
 */
export async function createConcert(data: ConcertRequest): Promise<ConcertVO> {
  // 前端使用 ticketGrades，后端使用 grades
  // 前端价格单位是元，后端是分
  const payload = {
    name: data.name,
    venue: data.venue,
    showTime: data.showTime,
    startSaleTime: data.startSaleTime,
    endSaleTime: data.endSaleTime,
    purchaseLimit: data.purchaseLimit,
    grades: data.ticketGrades?.map((g) => ({
      id: g.id,
      gradeName: g.gradeName,
      price: Math.round(g.price * 100), // 元转分
      totalStock: g.totalStock,
      isSelectedSeat: g.isSelectedSeat,
    })),
  };
  return post<ConcertVO>(API_ENDPOINTS.ADMIN_CONCERTS, payload);
}

/**
 * Update concert (Admin only)
 * @param id Concert ID
 * @param data Updated concert data
 * @returns Updated concert
 */
export async function updateConcert(
  id: number,
  data: ConcertRequest
): Promise<ConcertVO> {
  // 前端使用 ticketGrades，后端使用 grades
  // 前端价格单位是元，后端是分
  const payload = {
    name: data.name,
    venue: data.venue,
    showTime: data.showTime,
    startSaleTime: data.startSaleTime,
    endSaleTime: data.endSaleTime,
    purchaseLimit: data.purchaseLimit,
    status: data.status,
    grades: data.ticketGrades?.map((g) => ({
      id: g.id,
      gradeName: g.gradeName,
      price: Math.round(g.price * 100), // 元转分
      totalStock: g.totalStock,
      isSelectedSeat: g.isSelectedSeat,
    })),
  };
  return put<ConcertVO>(API_ENDPOINTS.ADMIN_CONCERT_DETAIL(id), payload);
}

/**
 * Delete concert (Admin only)
 * @param id Concert ID
 * @returns void
 */
export async function deleteConcert(id: number): Promise<string> {
  return del<string>(API_ENDPOINTS.ADMIN_CONCERT_DETAIL(id));
}

/**
 * Preheat cache for concert (Admin only)
 * @param concertId Concert ID
 * @returns Result message
 */
export async function preheatCache(concertId: number): Promise<string> {
  return post<string>(API_ENDPOINTS.ADMIN_CONCERT_PREHEAT(concertId));
}

/**
 * Get ticket grades for a concert (Admin only)
 * @param concertId Concert ID
 * @returns Ticket grade list
 */
export async function getGrades(concertId: number): Promise<TicketGradeVO[]> {
  return get<TicketGradeVO[]>(API_ENDPOINTS.ADMIN_CONCERT_GRADES(concertId));
}

/**
 * Create ticket grade for a concert (Admin only)
 * @param concertId Concert ID
 * @param data Ticket grade data
 * @returns Created ticket grade
 */
export async function createGrade(
  concertId: number,
  data: TicketGradeRequest
): Promise<TicketGradeVO> {
  return post<TicketGradeVO>(API_ENDPOINTS.ADMIN_CONCERT_GRADES(concertId), data);
}
