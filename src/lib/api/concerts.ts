import { get, post, put, del } from "./client";
import type {
  ConcertVO,
  ConcertDetailVO,
  ConcertRequest,
  ConcertQueryRequest,
  PageResult,
} from "@/types/api";
import { API_ENDPOINTS } from "@/lib/constants";

/**
 * Concerts API
 */

/**
 * Get concert list with pagination
 * @param params Query parameters
 * @returns Paginated concert list
 */
export async function getConcerts(
  params?: ConcertQueryRequest
): Promise<PageResult<ConcertVO>> {
  return get<PageResult<ConcertVO>>(API_ENDPOINTS.CONCERTS, { params });
}

/**
 * Get concert detail by ID
 * @param id Concert ID
 * @returns Concert detail with ticket grades
 */
export async function getConcertDetail(
  id: number
): Promise<ConcertDetailVO> {
  const response = await get<any>(API_ENDPOINTS.CONCERT_DETAIL(id));
  // Map backend 'grades' field to frontend 'ticketGrades' field
  return {
    ...response,
    ticketGrades: response.grades || [],
  };
}

/**
 * Get concert detail by ID (Admin)
 * @param id Concert ID
 * @returns Concert detail with ticket grades
 */
export async function getAdminConcertDetail(
  id: number
): Promise<ConcertDetailVO> {
  const response = await get<any>(API_ENDPOINTS.ADMIN_CONCERT_DETAIL(id));
  // Map backend 'grades' field to frontend 'ticketGrades' field
  return {
    ...response,
    ticketGrades: response.grades || [],
  };
}

/**
 * Create new concert (Admin only)
 * @param data Concert data
 * @returns Created concert
 */
export async function createConcert(data: ConcertRequest): Promise<ConcertVO> {
  return post<ConcertVO>(API_ENDPOINTS.ADMIN_CONCERTS, data);
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
  return put<ConcertVO>(API_ENDPOINTS.ADMIN_CONCERT_DETAIL(id), data);
}

/**
 * Delete concert (Admin only)
 * @param id Concert ID
 * @returns void
 */
export async function deleteConcert(id: number): Promise<void> {
  return del<void>(API_ENDPOINTS.ADMIN_CONCERT_DETAIL(id));
}
