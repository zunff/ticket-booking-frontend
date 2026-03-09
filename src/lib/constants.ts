/**
 * Application Constants
 */

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/api/users/login",
  REGISTER: "/api/users/register",
  LOGOUT: "/api/users/logout",

  // Concerts
  CONCERTS: "/api/concerts",
  CONCERT_DETAIL: (id: number) => `/api/concerts/${id}`,

  // Stock
  STOCK: (concertId: number, gradeId: number) =>
    `/api/stock/${concertId}/${gradeId}`,

  // Orders
  BOOK_TICKET: "/api/orders/book",
  USER_ORDERS: (userId: number) => `/api/orders/user/${userId}`,
  ORDER_DETAIL: (id: number) => `/api/orders/${id}`,

  // Admin
  ADMIN_CONCERTS: "/api/admin/concerts",
  ADMIN_CONCERT_DETAIL: (id: number) => `/api/admin/concerts/${id}`,
  ADMIN_ORDERS: "/api/admin/orders",
  ADMIN_STOCK_ADJUST: "/api/admin/stock/adjust",
  ADMIN_STOCK_LOGS: "/api/admin/stock/logs",
  ADMIN_DASHBOARD: "/api/admin/dashboard",
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
 */
export const ORDER_STATUS_LABELS: Record<number, string> = {
  1: "待支付",
  2: "已支付",
  3: "已取消",
  4: "失败",
};

/**
 * Order Status Colors
 */
export const ORDER_STATUS_COLORS: Record<number, string> = {
  1: "default",    // pending
  2: "success",    // paid
  3: "secondary",  // cancelled
  4: "destructive", // failed
};

/**
 * Concert Status Colors
 */
export const CONCERT_STATUS_COLORS: Record<number, string> = {
  0: "secondary",  // closed
  1: "success",    // on-sale
};

/**
 * Stock Level Colors
 */
export const STOCK_LEVEL_COLORS = {
  HIGH: "success",     // > 50%
  MEDIUM: "warning",   // 20-50%
  LOW: "destructive",  // < 20%
  OUT: "secondary",    // 0
} as const;

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
