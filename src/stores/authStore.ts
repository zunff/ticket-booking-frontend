import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserVO } from "@/types/api";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * Auth Store Interface
 */
interface AuthState {
  // State
  user: UserVO | null;
  token: string | null;
  isAuthenticated: boolean;
  _isInitialized: boolean; // Runtime flag, NOT persisted

  // Actions
  login: (user: UserVO, token: string) => void;
  logout: () => void;
  initialize: () => void;
  isAdmin: () => boolean;
  updateUser: (user: Partial<UserVO>) => void;
}

/**
 * Auth Store with JWT persistence
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      _isInitialized: false,

      // Actions
      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
          _isInitialized: true,
        });
        // Store in localStorage immediately for axios interceptor
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.TOKEN, token);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
          // Debug log - verify token is stored
          console.log("[Auth] Token saved to localStorage:", {
            key: STORAGE_KEYS.TOKEN,
            tokenPreview: token.substring(0, 20) + "...",
            verified: !!localStorage.getItem(STORAGE_KEYS.TOKEN),
          });
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          _isInitialized: true,
        });
        // Clear localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
        }
      },

      initialize: () => {
        const { user, token, _isInitialized: alreadyInitialized } = get();

        // Only update if not already initialized
        if (alreadyInitialized) {
          return;
        }

        const isValid = !!token && !!user;
        set({
          isAuthenticated: isValid,
          _isInitialized: true,
        });
      },

      isAdmin: () => {
        const { user } = get();
        return user?.isAdmin === true;
      },

      updateUser: (userData) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, ...userData };
          set({ user: updatedUser });
          // Update localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
          }
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist user and token (NOT _isInitialized)
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      // After rehydration, initialize the auth state
      onRehydrateStorage: () => (state) => {
        state?.initialize();
      },
    }
  )
);

/**
 * Auth hooks for common use cases
 */
export const useAuth = () => {
  const { user, token, isAuthenticated, isAdmin, login, logout, updateUser } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    isAdmin: isAdmin(),
    userId: user?.id,
    username: user?.username,
    login,
    logout,
    updateUser,
  };
};
