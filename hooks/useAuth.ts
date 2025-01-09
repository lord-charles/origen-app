import { create } from "zustand";
import authService, { User, LoginResponse } from "@/services/auth.service";
import { TokenService } from "@/utils/token";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { nationalId: string; pin: string }) => Promise<void>;
  logout: () => Promise<void>;
  findUserByNationalId: (
    nationalId: string
  ) => Promise<User | { error: string }>;
  initialize: () => Promise<void>;
  getWalletBalance: () => Promise<number>;
  getAdvanceSummary: () => Promise<any>;
}

export const useAuth = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      const token = await TokenService.getToken();
      const userData = await TokenService.getUserData<User>();

      if (token && userData) {
        set({
          isAuthenticated: true,
          user: userData,
          token,
          isLoading: false,
        });
      } else {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      set({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: "Failed to initialize authentication",
      });
    }
  },

  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.login(
        credentials.nationalId,
        credentials.pin
      );

      set({
        isAuthenticated: true,
        user: response.user,
        token: response.token,
        isLoading: false,
      });
    } catch (error: any) {
      console.error("Login failed:", error);
      set({
        isLoading: false,
        error:
          error.response?.data?.message || "Login failed. Please try again.",
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await authService.logout();
      set({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      });
    } catch (error) {
      console.error("Logout failed:", error);
      set({
        isLoading: false,
        error: "Logout failed. Please try again.",
      });
    }
  },

  findUserByNationalId: async (nationalId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.findUserByNationalId(nationalId);
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to find user.",
      });
      throw error;
    }
  },

  getWalletBalance: async () => {
    try {
      return await authService.getWalletBalance();
    } catch (error) {
      console.error("Failed to get wallet balance:", error);
      throw error;
    }
  },

  getAdvanceSummary: async () => {
    try {
      return await authService.getAvailableAdvance();
    } catch (error) {
      console.error("Failed to get advance summary:", error);
      throw error;
    }
  },
}));
