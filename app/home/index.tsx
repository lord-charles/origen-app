import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  useColorScheme,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Colors } from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import TransactionsService, {
  PaginationData,
  Transaction,
} from "@/services/transactions.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import AuthService from "@/services/auth.service"; // Import AuthService
import TransactionSection from "./TransactionSection";
import Header from "./header";
import TransactionModal from "./TransactionModal";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const services = [
  {
    id: "1",
    icon: "cash-outline" as keyof typeof Ionicons.glyphMap,
    label: "Salary Advance",
    colors: ["#4CAF50", "#45a049"] as [string, string],
    navigateTo: "/advance",
  },
  {
    id: "2",
    icon: "wallet-outline" as keyof typeof Ionicons.glyphMap,
    label: "Innova Wallet",
    colors: ["#2196F3", "#1e88e5"] as [string, string],
    navigateTo: "/wallet",
  },
  // {
  //   id: "3",
  //   icon: "cart-outline" as keyof typeof Ionicons.glyphMap,
  //   label: "Buy Goods/Pay Bills",
  //   colors: ["#9C27B0", "#8e24aa"] as [string, string],
  //   navigateTo: "/mpesa",
  // },
  // {
  //   id: "4",
  //   icon: "card-outline" as keyof typeof Ionicons.glyphMap,
  //   label: "Personal Loan",
  //   colors: ["#FF9800", "#f57c00"] as [string, string],
  //   navigateTo: "/loan",
  // },
] as const;

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const balanceScale = useSharedValue(1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [userId, setUserId] = useState("");
  const [advanceSummary, setAdvanceSummary] = useState({
    availableAdvance: 0,
    maxAdvance: 0,
    basicSalary: 0,
    advancePercentage: 0,
    previousAdvances: 0,
    nextPayday: "",
  });
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleTransactionPress = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalVisible(true);
  };

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      fetchTransactions();
      fetchAdvanceSummary();

      return () => {};
    }, [])
  );

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user_data");
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.firstName || "User");
        setUserId(user._id || "");
      }

      // Fetch latest wallet balance
      const balance = await AuthService.getWalletBalance();
      setWalletBalance(balance);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const fetchTransactions = async (page: number = 1) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await TransactionsService.getMyTransactions(page);
      const { transactions, pagination } = response;

      if (page === 1) {
        setTransactions(transactions);
      } else {
        setTransactions((prev) => [...prev, ...transactions]);
      }

      setPagination(pagination);
      setCurrentPage(page);
    } catch (error: any) {
      Toast.show({
        type: "err4CAF50or",
        text1: "Error",
        text2: error.message || "Failed to load transactions",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchAdvanceSummary = async () => {
    try {
      const summary = await AuthService.getAvailableAdvance();
      setAdvanceSummary(summary);
    } catch (error) {
      console.log("Error fetching advance summary:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not fetch advance summary",
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchTransactions(),
      loadUserData(),
      fetchAdvanceSummary(),
    ]);
    setRefreshing(false);
  };

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
    balanceScale.value = withSpring(isBalanceVisible ? 0.97 : 1);
  };

  const balanceAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: balanceScale.value }],
    };
  });

  useEffect(() => {
    balanceScale.value = withSpring(1);
  }, []);

  const ServiceCard = ({
    icon,
    label,
    colors,
    navigateTo,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    colors: [string, string];
    navigateTo: string;
  }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => {
        router.push(navigateTo as any);
      }}
    >
      <LinearGradient colors={colors} style={styles.serviceGradient}>
        <View style={styles.serviceIconContainer}>
          <Ionicons name={icon} size={24} color="white" />
        </View>
        <Text style={styles.serviceLabel}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const handleLoadMore = () => {
    if (pagination.hasNextPage && !loadingMore) {
      fetchTransactions(currentPage + 1);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1a237e" style="auto" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1a237e"]}
          />
        }
      >
        <Header
          userName={userName}
          walletBalance={walletBalance}
          isBalanceVisible={isBalanceVisible}
        />

        <View style={styles.balanceContainer}>
          <BlurView
            intensity={Platform.OS === "ios" ? 60 : 70}
            style={[styles.balanceBlur, balanceAnimatedStyle]}
            tint={colorScheme === "dark" ? "dark" : "light"}
          >
            <View style={[styles.balanceCard, { backgroundColor: "#45a049" }]}>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>
                  Max Advance You Can Apply For
                </Text>
                <TouchableOpacity onPress={toggleBalanceVisibility}>
                  <Ionicons
                    name={isBalanceVisible ? "eye-outline" : "eye-off-outline"}
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.balanceAmount}>
                KSh{" "}
                {isBalanceVisible
                  ? advanceSummary.availableAdvance.toLocaleString()
                  : "••••••"}
              </Text>
              <View style={styles.balanceFooter}>
                <View style={styles.balanceChange}>
                  <Ionicons name="arrow-up" size={16} color="white" />

                  <Text style={styles.changeText}>
                    +{advanceSummary.advancePercentage.toFixed(1)}% of salary
                  </Text>
                </View>

                <Text style={styles.periodText}>
                  Next payday:{" "}
                  {new Date(advanceSummary.nextPayday).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </BlurView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <ServiceCard key={service.id} {...service} />
            ))}
          </View>
        </View>

        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <View style={styles.transactionList}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
              </View>
            ) : transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="receipt-outline"
                  size={48}
                  color={theme.secondary}
                />
                <Text style={[styles.emptyText, { color: theme.secondary }]}>
                  No transactions yet
                </Text>
              </View>
            )}
          </View>
          {renderLoadMoreButton()}
        </View> */}

        <TransactionSection
          transactions={transactions}
          isLoading={loading}
          onLoadMore={handleLoadMore}
          pagination={pagination}
          onTransactionPress={handleTransactionPress}
          userId={userId}
        />
      </ScrollView>
      <Toast />
      <TransactionModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        transaction={selectedTransaction}
        userId={userId}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: Platform.OS === "ios" ? 0 : -26,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  header: {
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  iconButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF5252",
  },
  headerContent: {
    paddingHorizontal: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  balanceContainer: {
    marginTop: -24,
    marginHorizontal: 16,
  },
  balanceBlur: {
    overflow: "hidden",
    borderRadius: 16,
  },
  balanceCard: {
    backgroundColor: "green",
    padding: 16,
    borderRadius: 16,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  balanceFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceChange: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  changeText: {
    color: "white",
    fontWeight: "600",
  },
  periodText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a237e",
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  serviceCard: {
    width: (width - 48) / 2,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  serviceGradient: {
    padding: 16,
    height: 120,
    justifyContent: "space-between",
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  serviceLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  transactionList: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  transactionItem: {
    elevation: 2,
  },
  transactionIcon: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  transactionTitle: {
    lineHeight: 20,
  },
  transactionReference: {
    lineHeight: 18,
  },
  transactionAmount: {
    lineHeight: 24,
  },
  transactionDate: {
    lineHeight: 16,
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 12,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
  },
  // loadMoreButton: {
  //   marginTop: 16,
  //   elevation: 3,
  // },
  // loadMoreText: {
  //   color: "#fff",
  //   fontSize: 16,
  //   fontWeight: "600",
  // },
  loadMoreButton: {
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
