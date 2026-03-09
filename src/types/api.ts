/**
 * API Response Wrapper
 */
export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * Page Result Wrapper
 */
export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// ==================== Auth Types ====================

/**
 * Login Request
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Login Response
 */
export interface LoginResponse {
  user: UserVO;
  token: string;
}

/**
 * Register Request
 */
export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  phone: string;
}

// ==================== User Types ====================

/**
 * User View Object
 */
export interface UserVO {
  id: number;
  username: string;
  email: string;
  phone: string;
  status: number;
  isAdmin: boolean;
  createTime: string;
}

// ==================== Concert Types ====================

/**
 * Concert View Object
 */
export interface ConcertVO {
  id: number;
  name: string;
  venue: string;
  showTime: string;
  startSaleTime: string;
  endSaleTime: string;
  status: number;
  createdAt: string;
}

/**
 * Concert Detail View Object (with ticket grades)
 */
export interface ConcertDetailVO extends ConcertVO {
  ticketGrades: TicketGradeWithStockVO[];
}

/**
 * Concert Create/Update Request
 */
export interface ConcertRequest {
  id?: number;
  name: string;
  venue: string;
  showTime: string;
  startSaleTime: string;
  endSaleTime: string;
  status: number;
  ticketGrades: TicketGradeRequest[];
}

/**
 * Concert Query Request
 */
export interface ConcertQueryRequest {
  page?: number;
  size?: number;
  timeStatus?: 0 | 1 | 2 | 3; // 0-已关闭, 1-开售中, 2-即将开售, 3-已结束
  name?: string;
}

// ==================== Ticket Grade Types ====================

/**
 * Ticket Grade with Stock View Object
 */
export interface TicketGradeWithStockVO {
  id: number;
  concertId: number;
  gradeName: string;
  price: number;
  totalStock: number;
  availableStock: number;
  isSelectedSeat: number;
}

/**
 * Ticket Grade Request (for create/update)
 */
export interface TicketGradeRequest {
  id?: number;
  gradeName: string;
  price: number;
  totalStock: number;
  isSelectedSeat: number;
}

// ==================== Order Types ====================

/**
 * Order View Object
 */
export interface OrderVO {
  id: number;
  orderNo: string;
  userId: number;
  concertId: number;
  concertName: string;
  gradeId: number;
  gradeName: string;
  quantity: number;
  totalPrice: number;
  status: number;
  createTime: string;
}

/**
 * Book Ticket Request
 */
export interface BookTicketRequest {
  concertId: number;
  gradeId: number;
  quantity: number;
}

/**
 * Order Query Request
 */
export interface OrderQueryRequest {
  page?: number;
  size?: number;
  userId?: number;
  status?: number;
  orderNo?: string;
}

// ==================== Stock Types ====================

/**
 * Get Stock Response
 */
export interface GetStockResponse {
  stock: number;
}

/**
 * Adjust Stock Request
 */
export interface AdjustStockRequest {
  concertId: number;
  gradeId: number;
  quantity: number;
  operation: "INCREASE" | "DECREASE" | "SET";
  reason: string;
}

/**
 * Stock Log View Object
 */
export interface StockLogVO {
  id: number;
  concertId: number;
  concertName: string;
  gradeId: number;
  gradeName: string;
  changeQuantity: number;
  beforeStock: number;
  afterStock: number;
  operationType: string;
  operator: string;
  reason: string;
  createTime: string;
}

/**
 * Stock Log Query Request
 */
export interface StockLogQueryRequest {
  page?: number;
  size?: number;
  concertId?: number;
  gradeId?: number;
}

// ==================== Dashboard Types ====================

/**
 * Dashboard Statistics
 */
export interface DashboardStats {
  totalConcerts: number;
  onSaleConcerts: number;
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
}

/**
 * Sales Data Point
 */
export interface SalesDataPoint {
  date: string;
  orders: number;
  revenue: number;
}

/**
 * Concert Sales Statistics
 */
export interface ConcertSalesStats {
  concertId: number;
  concertName: string;
  totalOrders: number;
  totalTickets: number;
  totalRevenue: number;
  completionRate: number;
}
