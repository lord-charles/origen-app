import api from "@/utils/api";
import { TokenService } from "@/utils/token";

export interface ApprovedBy {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
}

export interface SalaryAdvance {
  _id: string;
  employee: string;
  amount: number;
  amountRepaid: number;
  purpose: string;
  status: "pending" | "approved" | "disbursed" | "repaid" | "repaying";
  requestedDate: string;
  repaymentPeriod: number;
  interestRate: number;
  totalRepayment: number;
  installmentAmount: number;
  comments: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: ApprovedBy;
  approvedDate?: string;
  disbursedBy?: ApprovedBy;
  disbursedDate?: string;
}

export interface AdvanceConfig {
  _id: string;
  key: string;
  type: string;
  data: {
    advanceDefaultInterestRate: number;
    advanceMinAmount: number;
    advanceMaxAmount: number;
    advanceMinRepaymentPeriod: number;
    advanceMaxRepaymentPeriod: number;
    advancePurposes: string[];
    maxAdvancePercentage: number;
    maxActiveAdvances: number;
  };
  isActive: boolean;
  description: string;
  updatedBy: string;
}

export interface AdvanceResponse {
  employee: string;
  amount: number;
  amountRepaid: number;
  purpose: string;
  status: "pending" | "approved" | "disbursed" | "repaid";
  requestedDate: string;
  repaymentPeriod: number;
  interestRate: number;
  totalRepayment: number;
  installmentAmount: number;
  comments: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdvanceRequest {
  amount: number;
  purpose: string;
  repaymentPeriod: number;
  comments: string;
  preferredPaymentMethod?: "mpesa" | "wallet";
}

export interface MonthlyAdvanceSummary {
  month: string;
  year: number;
  basicSalary: number;
  maxAdvancePercentage: number;
  maxAdvanceAmount: number;
  dailyAdvances: {
    date: string;
    availableAmount: number;
    percentageOfSalary: number;
    isWeekend: boolean;
    isHoliday: boolean;
  }[];
  totalAvailableToday: number;
  previousAdvances: SalaryAdvance[];
}

class AdvancesService {
  async getMyAdvances(): Promise<SalaryAdvance[]> {
    try {
      const response = await api.get("/advances/my-advances");
      return response.data;
    } catch (error) {
      console.error("Error fetching advances:", error);
      throw error;
    }
  }

  async getAdvanceConfig(): Promise<AdvanceConfig> {
    try {
      const response = await api.get("/system-config/advance/config");
      return response.data;
    } catch (error) {
      console.error("Error getting advance config:", error);
      throw error;
    }
  }

  async getAdvances(): Promise<SalaryAdvance[]> {
    try {
      const response = await api.get("/advances");
      return response.data;
    } catch (error) {
      console.error("Error getting advances:", error);
      throw error;
    }
  }

  async requestAdvance(data: AdvanceRequest): Promise<AdvanceResponse> {
    try {
      const response = await api.post("/advances", data);
      return response.data;
    } catch (error) {
      // console.error("Error requesting advance:", error);
      throw error;
    }
  }

  async repayAdvance(advanceId: string, amount: number): Promise<any> {
    try {
      const response = await api.post(`/advances/${advanceId}/repay`, {
        amount,
      });
      return response.data;
    } catch (error) {
      console.error("Error repaying advance:", error);
      throw error;
    }
  }

  async getAdvanceById(advanceId: string): Promise<SalaryAdvance> {
    try {
      const response = await api.get(`/advances/${advanceId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching advance:", error);
      throw error;
    }
  }

  async getMonthlyAdvanceSummary(
    month: string,
    year: number
  ): Promise<MonthlyAdvanceSummary> {
    try {
      const response = await api.get(
        `/advances/summary/monthly/${month}/${year}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting monthly advance summary:", error);
      throw error;
    }
  }
}

export default new AdvancesService();
