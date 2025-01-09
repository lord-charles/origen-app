import api from "@/utils/api";

export interface WalletTransferResponse {
  status: string;
  message: string;
  data: {
    transactionId: string;
    amount: number;
    description: string;
    timestamp: string;
    recipientName: string;
    senderBalance: number;
  };
}

export interface WalletTransferError {
  message: string;
  error: string;
  statusCode: number;
}

export interface WalletTransaction {
  _id: string;
  walletId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  transactionType: "withdrawal" | "transfer_to_wallet";
  amount: number;
  transactionId: string;
  transactionDate: string;
  status: "completed" | "pending" | "failed";
  recipientDetails: {
    recipientMpesaNumber?: string;
    recipientWalletId?: string;
  };
  description: string;
  createdAt: string;
  updatedAt: string;
}

class WalletService {
  async transferToWallet(data: {
    recipientWalletId: string;
    amount: number;
    description: string;
  }): Promise<WalletTransferResponse> {
    try {
      const response = await api.post<WalletTransferResponse>(
        "/wallet-payments/wallet-to-wallet",
        data
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw new Error("Failed to process transfer. Please try again.");
    }
  }

  async getTransactionHistory(): Promise<WalletTransaction[]> {
    const response = await api.get("/wallet-transactions/my-transactions");
    return response.data;
  }

  formatBalance(balance: number): string {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(balance);
  }
}

export default new WalletService();
