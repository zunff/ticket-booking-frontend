import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import type { ApiResult } from "@/types/api";

// API base URL from environment variable
// 如果NEXT_PUBLIC_API_URL为空，使用相对路径，通过Next.js rewrite转发到后端
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Create axios instance with default config
 */
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: false, // Set to false as we're using Authorization header
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor - Add auth token to requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (client-side only)
    if (typeof window !== "undefined") {
      // Try to get token from multiple sources for reliability
      let token = localStorage.getItem("token");

      // Also try to get from zustand persist storage
      if (!token) {
        try {
          const persistStorage = localStorage.getItem("auth-storage");
          if (persistStorage) {
            const parsed = JSON.parse(persistStorage);
            token = parsed.state?.token;
          }
        } catch (e) {
          // Ignore parse errors
        }
      }

      if (token && config.headers) {
        // Add "Bearer " prefix if not already present
        const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
        config.headers.Authorization = authHeader;
      }

      // Debug log - remove in production
      if (config.method === "post" && config.url?.includes("/admin")) {
        console.log("[API Request]", config.method?.toUpperCase(), config.url, {
          hasToken: !!token,
          hasAuthHeader: !!config.headers.Authorization,
        });
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle common responses and errors
 */
apiClient.interceptors.response.use(
  (response) => {
    // The backend returns ApiResult<T> format
    return response;
  },
  (error: AxiosError<ApiResult<any>>) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - Clear token but don't redirect (let app handle navigation)
          console.error("[401 Unauthorized]", {
            url: error.config?.url,
            method: error.config?.method?.toUpperCase(),
            hasToken: !!error.config?.headers?.Authorization,
            tokenPreview: typeof error.config?.headers?.Authorization === 'string'
              ? error.config.headers.Authorization.substring(0, 30) + "..."
              : undefined,
            responseData: data,
          });
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("auth-storage");
          }
          break;
        case 403:
          // Forbidden
          console.error("Access forbidden");
          break;
        case 404:
          // Not found
          console.error("Resource not found");
          break;
        case 500:
          // Server error
          console.error("Server error:", data?.message || "Internal server error");
          break;
        default:
          console.error("API error:", data?.message || error.message);
      }

      return Promise.reject({
        status,
        message: data?.message || error.message,
        code: data?.code || status,
      });
    }

    // Network error
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout");
      return Promise.reject({ message: "请求超时，请稍后重试", code: 408 });
    }

    if (!window.navigator.onLine) {
      console.error("Network offline");
      return Promise.reject({ message: "网络连接已断开", code: 0 });
    }

    return Promise.reject({ message: error.message, code: -1 });
  }
);

/**
 * Helper function to extract data from ApiResult
 */
export function extractData<T>(response: { data: ApiResult<T> }): T {
  return response.data.data;
}

/**
 * Helper function to handle API errors
 */
export function handleApiError(error: any): string {
  if (typeof error === "string") {
    return error;
  }
  if (error?.message) {
    return error.message;
  }
  return "操作失败，请稍后重试";
}

/**
 * Generic API request wrapper
 */
export async function request<T>(
  config: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.request<ApiResult<T>>(config);
    return extractData(response);
  } catch (error) {
    throw error;
  }
}

/**
 * GET request helper
 */
export function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ ...config, method: "GET", url });
}

/**
 * POST request helper
 */
export function post<T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  return request<T>({ ...config, method: "POST", url, data });
}

/**
 * PUT request helper
 */
export function put<T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  return request<T>({ ...config, method: "PUT", url, data });
}

/**
 * DELETE request helper
 */
export function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ ...config, method: "DELETE", url });
}

export default apiClient;
