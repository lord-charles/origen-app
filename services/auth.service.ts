import { TokenService } from "@/utils/token";
import api from "@/utils/api";

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  employeeId: string;
  department: string;
  position: string;
  status: string;
  employmentType: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

interface AdvanceSummary {
  availableAdvance: number;
  maxAdvance: number;
  basicSalary: number;
  advancePercentage: number;
  previousAdvances: number;
  nextPayday: string;
}

class AuthService {
  async login(nationalId: string, pin: string): Promise<LoginResponse> {
    try {
      const response = await api.post("/auth/login", {
        nationalId,
        pin,
      });

      await TokenService.setToken(response.data.token);
      await TokenService.setUserData(response.data.user);

      return response.data;
    } catch (error: any) {
      console.error("Error in login:", error);
      throw error;
    }
  }

  async logout() {
    await TokenService.clearAll();
  }

  async getCurrentUser() {
    return TokenService.getUserData();
  }

  async findUserByNationalId(nationalId: string) {
    try {
      const response = await api.get(`/user/national-id/${nationalId}`);
      await TokenService.setUserData(response.data);

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { error: "not_found" };
      }
      throw error;
    }
  }

  async getTempUserData() {
    try {
      const data = await TokenService.getUserData();
      return data;
    } catch (error) {
      console.error("Error getting temp user data:", error);
      return null;
    }
  }
  async getWalletBalance(): Promise<number> {
    try {
      const response = await api.get("/user/wallet-balance");
      return response.data.walletBalance;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getAvailableAdvance(): Promise<AdvanceSummary> {
    try {
      const response = await api.get("/advances/summary/current");
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default new AuthService();
