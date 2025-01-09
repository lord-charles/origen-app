import api from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";

export interface RecipientDetails {
  recipientWalletId: string;
  recipientMpesaNumber: string;
}

export interface WalletOwner {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Transaction {
  id?: string;
  _id?: string;
  transactionType: string;
  amount: number;
  phoneNumber: string;
  accountReference: string;
  status: string;
  createdAt: string;
  type: string;
  reason: string;
  date: string;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: PaginationData;
}

class TransactionsService {
  async getMyTransactions(
    page: number = 1,
    limit: number = 5
  ): Promise<TransactionsResponse> {
    try {
      const response = await api.get(
        `/transactions?page=${page}&limit=${limit}`
      );
      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch transactions"
      );
    }
  }

  async repayAdvance(data: {
    phoneNumber: string;
    amount: number;
  }): Promise<void> {
    try {
      await api.post("/advances/repay", data);
    } catch (error: any) {
      console.error("Error repaying advance:", error);
      throw new Error(
        error.response?.data?.message || "Failed to repay advance"
      );
    }
  }

  async getTransactionById(transactionId: string): Promise<Transaction> {
    try {
      const response = await api.get(`/transactions/${transactionId}`);
      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching transaction:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch transaction"
      );
    }
  }

  getTransactionIcon(type: string): keyof typeof Ionicons.glyphMap {
    switch (type.toLowerCase()) {
      case "paybill":
        return "card-outline";
      default:
        return "cash-outline";
    }
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  getTransactionColor(status: string): string {
    switch (status.toLowerCase()) {
      case "success":
        return "#4CAF50";
      case "failed":
        return "#F44336";
      case "pending":
        return "#FFC107";
      default:
        return "#757575";
    }
  }

  getTransactionTitle(transaction: Transaction): string {
    return `${transaction.transactionType
      .charAt(0)
      .toUpperCase()}${transaction.transactionType.slice(1)} Payment`;
  }
}

export default new TransactionsService();
