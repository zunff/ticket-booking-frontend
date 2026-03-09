/**
 * Concert Status Enum
 */
export enum ConcertStatus {
  CLOSED = 0,     // 已关闭
  ON_SALE = 1,    // 开售中
}

/**
 * Order Status Enum
 */
export enum OrderStatus {
  PENDING = 1,    // 待支付
  PAID = 2,       // 已支付
  CANCELLED = 3,  // 已取消
  FAILED = 4,     // 失败
}

/**
 * User Status Enum
 */
export enum UserStatus {
  INACTIVE = 0,   // 未激活
  ACTIVE = 1,     // 正常
  BANNED = 2,     // 已封禁
}

/**
 * Seat Selection Type Enum
 */
export enum SeatSelectionType {
  NO_SELECT = 0,  // 不选座
  SELECT_SEAT = 1,// 选座
}

/**
 * Ticket Grade Category Enum
 */
export enum TicketGradeCategory {
  VIP = "VIP",
  PREMIUM = "特等座",
  STANDARD = "一等座",
  ECONOMY = "二等座",
  BUDGET = "三等座",
}

/**
 * API Response Status Enum
 */
export enum ApiStatus {
  SUCCESS = 200,
  ERROR = 500,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  BAD_REQUEST = 400,
}

/**
 * Stock Operation Type Enum
 */
export enum StockOperationType {
  INCREASE = "INCREASE",    // 增加库存
  DECREASE = "DECREASE",    // 减少库存
  SET = "SET",              // 设置库存
}
