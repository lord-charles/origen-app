import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import walletService, { WalletTransaction } from "@/services/wallet.service";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HEADER_HEIGHT = 290;
const { width } = Dimensions.get("window");

export default function TransactionHistoryScreen() {
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "withdrawal" | "sent" | "received"
  >("all");
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<WalletTransaction | null>(null);
  const [userName, setUserName] = useState("");
  const scrollY = useSharedValue(0);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    loadUserData();
    fetchTransactions();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user_data");
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.firstName || "User");
        setUserId(user._id);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const data = await walletService.getTransactionHistory();
      setTransactions(data);
      setRefreshing(false);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransactions();
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [-50, 0, HEADER_HEIGHT],
      [HEADER_HEIGHT + 50, HEADER_HEIGHT, 70],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
      [1, 0.5, 0],
      Extrapolation.CLAMP
    );

    return { height, opacity };
  });

  const calculateTotals = () => {
    const sent = transactions.reduce((acc, curr) => {
      if (
        curr.status === "completed" &&
        (curr.transactionType === "withdrawal" ||
          (curr.transactionType === "transfer_to_wallet" &&
            curr.recipientDetails.recipientWalletId !== userId))
      ) {
        return acc + curr.amount;
      }
      return acc;
    }, 0);

    const received = transactions.reduce((acc, curr) => {
      if (
        curr.status === "completed" &&
        curr.transactionType === "transfer_to_wallet" &&
        curr.recipientDetails.recipientWalletId === userId
      ) {
        return acc + curr.amount;
      }
      return acc;
    }, 0);

    const totalCompleted = transactions.reduce((acc, curr) => {
      if (curr.status === "completed") {
        return acc + curr.amount;
      }
      return acc;
    }, 0);

    return { totalCompleted, sent, received };
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (selectedFilter === "all") return true;
      if (selectedFilter === "withdrawal") {
        return transaction.transactionType === "withdrawal";
      }
      if (transaction.transactionType === "transfer_to_wallet") {
        if (transaction.recipientDetails.recipientWalletId === userId) {
          return selectedFilter === "received";
        } else {
          return selectedFilter === "sent";
        }
      }
      return false;
    });
  }, [transactions, selectedFilter, userId]);

  const renderTransaction = ({ item }: { item: WalletTransaction }) => (
    <TouchableOpacity
      style={styles.transactionCard}
      onPress={() => setSelectedTransaction(item)}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={
            item.transactionType === "withdrawal" ||
            (item.transactionType === "transfer_to_wallet" &&
              item.recipientDetails.recipientWalletId !== userId)
              ? "arrow-up-circle"
              : "arrow-down-circle"
          }
          size={24}
          color={getStatusColor(item.status)}
        />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionAmount}>
          {(item.transactionType === "withdrawal" ||
          (item.transactionType === "transfer_to_wallet" &&
            item.recipientDetails.recipientWalletId !== userId)
            ? "-"
            : "+") +
            "KSh " +
            item.amount.toLocaleString()}
        </Text>
        <Text style={styles.transactionDate}>
          {formatDate(item.transactionDate)}
        </Text>
        <Text style={styles.transactionParty}>
          {item.transactionType === "withdrawal"
            ? `To M-Pesa (${item.recipientDetails.recipientMpesaNumber})`
            : item.recipientDetails.recipientWalletId === userId
            ? "Received from wallet"
            : "Sent to wallet"}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const ListHeader = () => {
    const totals = calculateTotals();

    return (
      <BlurView intensity={10} tint="dark" style={styles.headerBlur}>
        <LinearGradient colors={["#1a237e", "#1565c0"]} style={styles.header}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              accessibilityLabel="Go back"
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Transaction History</Text>
            <TouchableOpacity
              style={styles.infoButton}
              accessibilityLabel="More information"
              onPress={() =>
                Alert.alert(
                  "Information",
                  "This screen shows your wallet transaction history. You can view all your transactions, filter by sent, received, or withdrawals, and see transaction details. The totals at the top show your completed transactions, sent amount, and received amount."
                )
              }
            >
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.headerContent, headerStyle]}>
            <View>
              <Text style={styles.headerGreeting}>Hi {userName}</Text>
              <Text style={styles.headerSubtitle}>
                Track your wallet transactions
              </Text>
            </View>

            <View style={styles.statsContainer}>
              <StatItem
                title="Completed"
                value={totals.totalCompleted.toLocaleString()}
              />
              <StatItem title="Sent" value={totals.sent.toLocaleString()} />
              <StatItem
                title="Received"
                value={totals.received.toLocaleString()}
              />
            </View>
            <View style={styles.filterContainer}>
              <FilterButton
                title="All"
                active={selectedFilter === "all"}
                onPress={() => setSelectedFilter("all")}
              />
              <FilterButton
                title="Sent"
                active={selectedFilter === "sent"}
                onPress={() => setSelectedFilter("sent")}
              />
              <FilterButton
                title="Received"
                active={selectedFilter === "received"}
                onPress={() => setSelectedFilter("received")}
              />
              <FilterButton
                title="Withdrawals"
                active={selectedFilter === "withdrawal"}
                onPress={() => setSelectedFilter("withdrawal")}
              />
            </View>
          </View>
        </LinearGradient>
        <View className="pb-3 bg-white" />
      </BlurView>
    );
  };

  const StatItem = ({ title, value }: { title: string; value: string }) => (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const FilterButton = ({
    title,
    active,
    onPress,
  }: {
    title: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterButtonText,
          active && styles.filterButtonTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const TransactionDetailsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={!!selectedTransaction}
      onRequestClose={() => setSelectedTransaction(null)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {selectedTransaction && (
            <>
              <Text style={styles.modalTitle}>Transaction Details</Text>
              <DetailRow
                label="Transaction ID"
                value={selectedTransaction.transactionId}
              />
              <DetailRow
                label="Type"
                value={
                  selectedTransaction.transactionType === "withdrawal"
                    ? "M-Pesa Withdrawal"
                    : selectedTransaction.recipientDetails.recipientWalletId ===
                      userId
                    ? "Received from Wallet"
                    : "Sent to Wallet"
                }
              />
              <DetailRow
                label="Amount"
                value={
                  (selectedTransaction.transactionType === "withdrawal" ||
                  (selectedTransaction.transactionType ===
                    "transfer_to_wallet" &&
                    selectedTransaction.recipientDetails.recipientWalletId !==
                      userId)
                    ? "-"
                    : "+") +
                  "KSh " +
                  selectedTransaction.amount.toLocaleString()
                }
              />
              <DetailRow
                label="Date"
                value={formatDate(selectedTransaction.transactionDate)}
              />
              <DetailRow
                label="Status"
                value={
                  selectedTransaction.status.charAt(0).toUpperCase() +
                  selectedTransaction.status.slice(1)
                }
              />
              <DetailRow
                label="Description"
                value={selectedTransaction.description}
              />
              {selectedTransaction.recipientDetails.recipientMpesaNumber && (
                <DetailRow
                  label="M-Pesa Number"
                  value={
                    selectedTransaction.recipientDetails.recipientMpesaNumber
                  }
                />
              )}
              {selectedTransaction.recipientDetails.recipientWalletId && (
                <DetailRow
                  label="Recipient Wallet"
                  value={selectedTransaction.recipientDetails.recipientWalletId}
                />
              )}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedTransaction(null)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1a237e" translucent={true} style="light" />

      <Animated.FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            titleColor="#fff"
            colors={["#1a237e"]}
          />
        }
      />
      <TransactionDetailsModal />
    </SafeAreaView>
  );
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "#4CAF50";
    case "pending":
      return "#FFC107";
    case "failed":
      return "#F44336";
    default:
      return "#9E9E9E";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContent: {
    paddingBottom: 20,
  },
  headerBlur: {
    overflow: "hidden",
  },
  header: {
    height: HEADER_HEIGHT,
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerContent: {
    padding: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  infoButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  headerGreeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  filterButtonActive: {
    backgroundColor: "#fff",
  },
  filterButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  filterButtonTextActive: {
    color: "#1a237e",
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  transactionParty: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 10,
    marginTop: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#1a237e",
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  statItem: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
    minWidth: width / 3.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  statTitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
});
