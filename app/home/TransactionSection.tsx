import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Transaction, PaginationData } from "@/services/transactions.service";

interface TransactionSectionProps {
  transactions: Transaction[];
  isLoading: boolean;
  onLoadMore: () => void;
  pagination: PaginationData;
  onTransactionPress?: (transaction: Transaction) => void;
  userId: string;
}

const TransactionSection: React.FC<TransactionSectionProps> = ({
  transactions,
  isLoading,
  onLoadMore,
  pagination,
  onTransactionPress,
  userId,
}) => {
  const getIconName = (type: string) => {
    switch (type) {
      case "paybill":
        return "receipt-outline";
      default:
        return "cash-outline";
    }
  };
  const getIconColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "failed":
        return "#EF4444";
      case "success":
      case "completed":
        return "#22C55E";
      default:
        return "#F59E0B";
    }
  };

  const formatAmount = (
    amount: number,
    transactionType: string,
    transaction: Transaction
  ) => {
    const sign =
      transactionType === "b2c" ||
      (transaction.accountReference &&
        transaction.accountReference.includes("mpesa-to-wallet"))
        ? "+"
        : transaction.transactionType === "transfer_to_wallet" &&
          userId === transaction.phoneNumber
        ? "+"
        : "-";
    return `${sign} KES ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderTransactionItem = (transaction: Transaction, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.transactionItem}
      onPress={() => onTransactionPress?.(transaction)}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getIconColor(transaction.status) + "20" },
        ]}
      >
        <Ionicons
          name={getIconName(transaction.transactionType)}
          size={24}
          color={getIconColor(transaction.status)}
        />
      </View>
      <View style={styles.transactionDetails}>
        <View>
          <Text style={styles.transactionType}>
            {transaction.transactionType.toUpperCase()}
          </Text>
          <Text style={styles.accountReference} numberOfLines={1}>
            {transaction?.accountReference?.length > 20
              ? `${transaction?.accountReference?.slice(0, 17)}...`
              : transaction?.accountReference || ""}
          </Text>
          <Text style={styles.date}>{formatDate(transaction.date)}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text
            style={[styles.amount, { color: getIconColor(transaction.status) }]}
          >
            {formatAmount(
              transaction.amount,
              transaction.transactionType,
              transaction
            )}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getIconColor(transaction.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getIconColor(transaction.status) },
              ]}
            >
              {transaction.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Transactions</Text>
      {isLoading && transactions.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>No transactions yet</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {transactions.map(renderTransactionItem)}
        </ScrollView>
      )}
      {pagination.hasNextPage && (
        <TouchableOpacity
          onPress={onLoadMore}
          style={styles.loadMoreButton}
          activeOpacity={0.8}
        >
          <Text style={styles.loadMoreText}>Load More</Text>
          <Ionicons
            name="arrow-down-circle-outline"
            size={20}
            color="#fff"
            style={styles.loadMoreIcon}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    padding: 10,
    marginBottom: -15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 20,
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 250,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6B7280",
  },
  scrollView: {
    flex: 1,
    minHeight: 250,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  accountReference: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  amountContainer: {
    gap: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  date: {
    fontSize: 12,
    color: "#6B7280",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-end",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  loadMoreButton: {
    backgroundColor: "#2196F3",
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginHorizontal: 10,
    marginTop: 20,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  loadMoreText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  loadMoreIcon: {
    marginLeft: 4,
  },
});

export default TransactionSection;
