/**
 * Domain Models
 * These are type aliases for API types used in the frontend
 */

export type {
  // Auth
  LoginRequest,
  LoginResponse,
  RegisterRequest,

  // User
  UserVO,

  // Concert
  ConcertVO,
  ConcertDetailVO,
  ConcertRequest,
  ConcertQueryRequest,

  // Ticket Grade
  TicketGradeWithStockVO,
  TicketGradeRequest,

  // Order
  OrderVO,
  BookTicketRequest,
  BookTicketResponse,
  OrderQueryRequest,

  // Stock
  GetStockResponse,
  AdjustStockRequest,
  StockLogVO,
  StockLogQueryRequest,

  // Dashboard
  DashboardStats,
  SalesDataPoint,
  ConcertSalesStats,
} from "./api";

/**
 * Form State Types
 */
export interface LoginFormState {
  username: string;
  password: string;
}

export interface RegisterFormState {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  phone: string;
}

export interface BookingFormState {
  concertId: number;
  gradeId: number | null;
  quantity: number;
}

/**
 * UI State Types
 */
export interface PaginationState {
  page: number;
  size: number;
  total: number;
}

export interface FilterState {
  status?: number;
  search?: string;
  dateRange?: [string, string];
}

/**
 * Cart Item Type (for future shopping cart feature)
 */
export interface CartItem {
  concertId: number;
  concertName: string;
  gradeId: number;
  gradeName: string;
  price: number;
  quantity: number;
  maxQuantity: number;
}

/**
 * Notification Type
 */
export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
}
