import api from "@/utils/api";
import { TokenService } from "@/utils/token";
import { User } from "./auth.service";

export interface MpesaResponse {
  success: boolean;
  message: string;
  data: {
    merchantRequestId: string;
    checkoutRequestId: string;
    responseDescription: string;
    transactionId: string;
  };
}

export interface MpesaB2CResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    transactionId: string;
    employeeId: string;
    amount: number;
    phoneNumber: string;
    status: string;
  };
}

class MpesaService {
  async initiateSTKPush(data: {
    phoneNumber: string;
    amount: number;
    accountReference: string;
  }): Promise<MpesaResponse> {
    try {
      const response = await api.post("/payment/initiate-c2b", data);
      return response.data;
    } catch (error: any) {
      console.error("Error initiating STK push:", error.response.data);
      throw error;
    }
  }

  async mpesaToWallet(data: {
    phoneNumber: string;
    amount: number;
    recipientWalletId: string;
  }): Promise<MpesaResponse> {
    try {
      const response = await api.post("/wallet-payments/mpesa-to-wallet", data);
      return response.data;
    } catch (error: any) {
      console.error(
        "Error initiating mpesa to wallet transfer:",
        error.response?.data
      );
      throw error;
    }
  }

  async initiateB2CTransfer(data: {
    phoneNumber: string;
    amount: number;
  }): Promise<MpesaB2CResponse> {
    try {
      const response = await api.post("/wallet-payments/wallet-to-mpesa", data);
      return response.data;
    } catch (error: any) {
      console.error(
        "Error initiating wallet to mpesa transfer:",
        error.response?.data
      );
      throw error;
    }
  }
}

export default new MpesaService();
