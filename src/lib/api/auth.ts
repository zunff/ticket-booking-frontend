import { post, put } from "./client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserVO,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "@/types/api";
import { API_ENDPOINTS } from "@/lib/constants";

/**
 * Authentication API
 */

/**
 * User login
 * @param data Login credentials
 * @returns LoginResponse with user and token
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  return post<LoginResponse>(API_ENDPOINTS.LOGIN, data);
}

/**
 * User registration
 * @param data Registration information
 * @returns LoginResponse with user and token
 */
export async function register(data: RegisterRequest): Promise<LoginResponse> {
  return post<LoginResponse>(API_ENDPOINTS.REGISTER, data);
}

/**
 * User logout
 * @returns void
 */
export async function logout(): Promise<void> {
  return post<void>(API_ENDPOINTS.LOGOUT);
}

/**
 * Get current user info
 * @returns Current user
 */
export async function getCurrentUser(): Promise<UserVO> {
  return post<UserVO>(API_ENDPOINTS.CURRENT_USER);
}

/**
 * Update user profile
 * @param data Profile update data
 * @returns Updated user
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<UserVO> {
  return put<UserVO>(API_ENDPOINTS.UPDATE_PROFILE, data);
}

/**
 * Change password
 * @param data Password change data
 * @returns void
 */
export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  return put<void>(API_ENDPOINTS.CHANGE_PASSWORD, data);
}
