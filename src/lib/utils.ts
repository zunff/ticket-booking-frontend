import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { parse } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export date-fns format for convenience
export { format } from "date-fns";

/**
 * 解析后端返回的时间字符串
 * 支持格式: "2026-03-30T07:00:00" (ISO) 或 "2026-03-30 07:00:00" (自定义)
 * 避免时区转换问题
 */
export function parseDateTime(dateStr: string): Date {
  if (!dateStr) return new Date();
  // 尝试解析 ISO 格式
  if (dateStr.includes("T")) {
    return new Date(dateStr);
  }
  // 解析自定义格式 "yyyy-MM-dd HH:mm:ss"
  return parse(dateStr, "yyyy-MM-dd HH:mm:ss", new Date());
}
