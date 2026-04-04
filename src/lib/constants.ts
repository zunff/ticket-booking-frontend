/**
 * Application Constants
 */

/**
 * API Endpoints
 *
 * 重要：所有请求通过网关 (localhost:9000)，必须加 /api 前缀！
 *
 * 网关路由规则 (StripPrefix=1 会剥离 /api 前缀):
 * - /api/users/**  -> 用户服务 (8081)  -> /users/**
 * - /api/ticket/** -> 演唱会服务 (8080) -> /ticket/**
 * - /api/order/**  -> 订单服务 (8082)  -> /order/**
 * - /api/stock/**  -> 库存服务 (8083)  -> /stock/**
 *
 * 示例：
 * - 前端请求: /api/users/login
 * - 网关剥离 /api 后转发: /users/login
 * - 后端实际路径: POST /users/login
 */
export const API_ENDPOINTS = {
  // Auth (用户服务)
  LOGIN: "/api/users/login",
  REGISTER: "/api/users/register",
  LOGOUT: "/api/users/logout",
  CURRENT_USER: "/api/users/me",
  UPDATE_PROFILE: "/api/users/profile",
  CHANGE_PASSWORD: "/api/users/password",

  // Concerts (演唱会服务)
  CONCERTS: "/api/ticket/concerts",
  CONCERT_DETAIL: (id: number) => `/api/ticket/concerts/${id}`,

  // Stock (库存服务) - 批量获取演唱会所有票档库存
  CONCERT_STOCKS: (concertId: number) => `/api/stock/${concertId}`,
  // 单个票档库存日志
  STOCK_LOGS_BY_GRADE: (concertId: number, gradeId: number) =>
    `/api/stock/logs/${concertId}/${gradeId}`,

  // Orders (订单服务)
  BOOK_TICKET: "/api/order/book",
  USER_ORDERS: (userId: number) => `/api/order/user/${userId}`,
  ORDER_DETAIL: (orderNo: string) => `/api/order/${orderNo}`,

  // Admin - Concerts (演唱会服务)
  ADMIN_CONCERTS: "/api/ticket/admin/concerts",
  ADMIN_CONCERT_DETAIL: (id: number) => `/api/ticket/admin/concerts/${id}`,
  ADMIN_CONCERT_PREHEAT: (concertId: number) =>
    `/api/ticket/admin/concerts/${concertId}/preheat`,
  ADMIN_CONCERT_GRADES: (concertId: number) =>
    `/api/ticket/admin/concerts/${concertId}/grades`,

  // Admin - Orders (订单服务)
  ADMIN_ORDERS: "/api/order/admin",
  ADMIN_ORDER_DETAIL: (orderNo: string) => `/api/order/admin/${orderNo}`,
  ADMIN_USER_ORDERS: (userId: number) => `/api/order/admin/user/${userId}`,

  // Admin - Stock (库存服务)
  ADMIN_STOCK_ADJUST: "/api/stock/admin/adjust",
  ADMIN_STOCK_LOGS: "/api/stock/admin/logs",
  ADMIN_STOCK_LOGS_BY_GRADE: (concertId: number, gradeId: number) =>
    `/api/stock/admin/logs/${concertId}/${gradeId}`,

  // Admin - Dashboard (演唱会服务)
  ADMIN_DASHBOARD: "/api/ticket/admin/dashboard",
  ADMIN_DASHBOARD_SALES: "/api/ticket/admin/dashboard/sales",
  ADMIN_DASHBOARD_CONCERTS: "/api/ticket/admin/dashboard/concerts",
} as const;

/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  CONCERT_CACHE: "concert_cache",
  STOCK_CACHE: "stock_cache",
} as const;

/**
 * Pagination Defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_SIZE: 10,
  PAGE_SIZES: [10, 20, 50, 100],
} as const;

/**
 * Stock Polling Interval (milliseconds)
 */
export const STOCK_POLLING_INTERVAL = 3000;

/**
 * Booking Constraints
 */
export const BOOKING = {
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 5,
  LOW_STOCK_THRESHOLD: 10,
} as const;

/**
 * Toast Duration (milliseconds)
 */
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000,
} as const;

/**
 * Date Formats
 */
export const DATE_FORMATS = {
  DATE_TIME: "yyyy-MM-dd HH:mm:ss",
  DATE: "yyyy-MM-dd",
  TIME: "HH:mm:ss",
  MONTH: "yyyy-MM",
  YEAR: "yyyy",
} as const;

/**
 * Concert Status Labels
 */
export const CONCERT_STATUS_LABELS: Record<number, string> = {
  0: "已关闭",
  1: "开售中",
};

/**
 * Order Status Labels
 * 订单状态：0-处理中 1-待支付 2-已支付 3-已取消 4-失败
 */
export const ORDER_STATUS_LABELS: Record<number, string> = {
  0: "处理中",
  1: "待支付",
  2: "已支付",
  3: "已取消",
  4: "失败",
};

/**
 * Order Status Colors (Badge variants + background colors for cards)
 */
export const ORDER_STATUS_COLORS: Record<number, string> = {
  0: "secondary",  // processing - 灰色
  1: "default",    // pending - 蓝色
  2: "success",    // paid - 绿色
  3: "outline",    // cancelled - 无背景
  4: "destructive", // failed - 红色
};

/**
 * Order Status Background Colors (for card styling)
 */
export const ORDER_STATUS_BG: Record<number, string> = {
  0: "bg-muted/50 border-muted",        // processing
  1: "bg-blue-500/10 border-blue-500/30", // pending
  2: "bg-green-500/10 border-green-500/30", // paid
  3: "bg-muted/30 border-muted",        // cancelled
  4: "bg-red-500/10 border-red-500/30", // failed
};

/**
 * Concert Status Colors
 */
export const CONCERT_STATUS_COLORS: Record<number, string> = {
  0: "secondary",  // closed
  1: "success",    // on-sale
};

/**
 * Stock Level Colors (Badge variants)
 */
export const STOCK_LEVEL_COLORS = {
  HIGH: "default" as const,      // > 50%
  MEDIUM: "secondary" as const,  // 20-50%
  LOW: "destructive" as const,   // < 20%
  OUT: "outline" as const,       // 0
};

/**
 * Avatar Fallback Names
 */
export const AVATAR_FALLBACKS = {
  USER: "U",
  ADMIN: "A",
  GUEST: "G",
} as const;

/**
 * Admin Sidebar Navigation
 */
export const ADMIN_NAV_ITEMS = [
  {
    title: "仪表盘",
    href: "/admin/dashboard",
    icon: "LayoutDashboard",
  },
  {
    title: "演唱会管理",
    href: "/admin/concerts",
    icon: "Music",
  },
  {
    title: "订单管理",
    href: "/admin/orders",
    icon: "ShoppingCart",
  },
  {
    title: "库存管理",
    href: "/admin/stock",
    icon: "Package",
  },
] as const;

/**
 * User Navigation Items
 */
export const USER_NAV_ITEMS = [
  {
    title: "演唱会",
    href: "/concerts",
    icon: "Music",
  },
  {
    title: "我的订单",
    href: "/orders",
    icon: "Ticket",
  },
] as const;

/**
 * Default Poster Image (placeholder)
 */
export const DEFAULT_POSTER = "/images/default-poster.svg";

/**
 * App Name
 */
export const APP_NAME = "霓虹票务";
