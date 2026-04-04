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
  nickname?: string;
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
  nickname: string;
  email: string;
  phone: string;
  status: number;
  isAdmin: boolean;
  createTime: string;
}

/**
 * Update Profile Request
 */
export interface UpdateProfileRequest {
  nickname?: string;
  email?: string;
  phone?: string;
}

/**
 * Change Password Request
 */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
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
  purchaseLimit: number;
  status: number;
  statusText?: string;
  createdAt: string;
}

/**
 * Concert Detail with Stock View Object
 * 包含库存信息的演唱会详情，不再需要单独轮询库存
 */
export interface ConcertDetailWithStockVO {
  id: number;
  name: string;
  venue: string;
  showTime: string;
  startSaleTime: string;
  endSaleTime: string;
  status: number;
  statusText?: string;
  purchaseLimit: number;        // 限购数量
  userPurchasedCount: number;   // 用户已购买数量
  canPurchase: boolean;         // 是否可购买
  createdAt: string;
  grades: TicketGradeWithStockVO[];     // 后端返回的原始字段
  ticketGrades?: TicketGradeWithStockVO[]; // 前端使用的别名 (API 层会自动映射)
}

/**
 * @deprecated 使用 ConcertDetailWithStockVO 替代
 */
export type ConcertDetailVO = ConcertDetailWithStockVO;

/**
 * Concert Create/Update Request
 * 注意：后端使用 grades 字段
 */
export interface ConcertRequest {
  id?: number;
  name: string;
  venue: string;
  showTime: string;
  startSaleTime: string;
  endSaleTime: string;
  purchaseLimit: number;
  status?: number;  // 创建时不需要，更新时需要
  grades?: TicketGradeQO[];  // 后端使用 grades
  ticketGrades?: TicketGradeRequest[];  // 前端使用，API 层会映射到 grades
}

/**
 * Concert Query Request
 * 注意：分页参数使用 current 而不是 page
 */
export interface ConcertQueryRequest {
  current?: number;
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
 * Ticket Grade View Object (Admin)
 */
export interface TicketGradeVO {
  id: number;
  concertId: number;
  gradeName: string;
  price: number;
  totalStock: number;
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

/**
 * Ticket Grade QO (Query Object for concert create/update)
 * 注意：price 单位是分（后端），前端使用元
 */
export interface TicketGradeQO {
  id?: number;  // 更新时传入，新增时不传
  gradeName: string;
  price: number;  // 单位：分
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
  failReason?: string;  // 订单失败原因
  createTime: string;
}

/**
 * Book Ticket Request
 * quantity 默认为 1，可不传
 */
export interface BookTicketRequest {
  concertId: number;
  gradeId: number;
  quantity?: number;  // 可选，默认为 1
}

/**
 * Order Query Request
 * 注意：分页参数使用 current 而不是 page
 */
export interface OrderQueryRequest {
  current?: number;
  size?: number;
  userId?: number;
  status?: number;
  orderNo?: string;
}

// ==================== Stock Types ====================

/**
 * Stock DTO (Internal)
 */
export interface StockDTO {
  id: number;
  concertId: number;
  concertName: string;
  gradeId: number;
  gradeName: string;
  price: number;
  availableStock: number;
  purchaseLimit: number;
}

/**
 * Stock Response for a concert (Map<gradeId, stock>)
 */
export type ConcertStockResponse = Record<string, number>;

/**
 * Adjust Stock Request (Admin)
 * 注意：后端现在使用 newStock 而不是 quantity + operation
 */
export interface AdjustStockRequest {
  concertId: number;
  gradeId: number;
  newStock: number;        // 新的库存值
  remark?: string;         // 调整备注
}

/**
 * @deprecated 使用 AdjustStockRequest 替代
 */
export interface LegacyAdjustStockRequest {
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
 * 注意：分页参数使用 current 而不是 page
 */
export interface StockLogQueryRequest {
  current?: number;
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
