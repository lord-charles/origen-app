import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ListRenderItemInfo,
  Platform,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { FlatListProps } from "react-native/Libraries/Lists/FlatList";
import { SafeAreaView } from "react-native-safe-area-context";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import { LoaderScreen } from "react-native-ui-lib";
import { router } from "expo-router";
import advancesService, { SalaryAdvance } from "@/services/advances.service";
import { Colors } from "@/constants/Colors";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

// Types
type SalaryAdvanceHistoryState = {
  data: SalaryAdvance[];
  isLoading: boolean;
  error: string | null;
};

// Constants
const HEADER_HEIGHT = 200;
const ITEM_HEIGHT = 120;

const AnimatedFlatList =
  Animated.createAnimatedComponent<FlatListProps<SalaryAdvance>>(FlatList);

const fetchSalaryAdvanceHistory = async (): Promise<SalaryAdvance[]> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  return advancesService.getMyAdvances();
};

const AdvanceSkeletonLoader = () => (
  <View style={styles.skeletonContainer}>
    {[1, 2, 3].map((key) => (
      <Animated.View
        key={key}
        entering={FadeInDown.delay(key * 100)}
        style={styles.skeletonItem}
      >
        <View style={styles.skeletonHeader}>
          <ShimmerPlaceholder
            style={styles.skeletonAmount}
            shimmerColors={["#2a347e", "#3f51b5", "#2a347e"]}
          />
          <ShimmerPlaceholder
            style={styles.skeletonStatus}
            shimmerColors={["#2a347e", "#3f51b5", "#2a347e"]}
          />
        </View>
        <View style={styles.skeletonDetails}>
          <ShimmerPlaceholder
            style={styles.skeletonDate}
            shimmerColors={["#2a347e", "#3f51b5", "#2a347e"]}
          />
          <ShimmerPlaceholder
            style={styles.skeletonDate}
            shimmerColors={["#2a347e", "#3f51b5", "#2a347e"]}
          />
        </View>
      </Animated.View>
    ))}
  </View>
);

export default function SalaryAdvanceHistoryScreen() {
  const [state, setState] = useState<SalaryAdvanceHistoryState>({
    data: [],
    isLoading: true,
    error: null,
  });
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useSharedValue(0);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchSalaryAdvanceHistory();
      setState((prevState) => ({
        ...prevState,
        data,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState((prevState) => ({
        ...prevState,
        isLoading: false,
        error: "Failed to load data",
      }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [HEADER_HEIGHT, 70],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT - 100],
      [1, 0],
      Extrapolation.CLAMP
    );

    return {
      height,
      opacity,
    };
  });

  const titleStyle = useAnimatedStyle(() => {
    const fontSize = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [24, 18],
      Extrapolation.CLAMP
    );

    return {
      fontSize,
    };
  });

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<SalaryAdvance>) => (
      <Animated.View
        entering={FadeInDown.delay(200).duration(500)}
        style={styles.advanceItem}
      >
        <LinearGradient
          colors={["#f8f9fa", "#ffffff"]}
          style={styles.advanceItemGradient}
        >
          <View style={styles.advanceItemHeader}>
            <View>
              <Text
                style={styles.advanceItemAmount}
                accessibilityLabel={`Amount: ${item.amount} Kenyan Shillings`}
              >
                KSh {item.amount.toLocaleString()}
              </Text>
              <Text style={styles.purposeText}>{item.purpose}</Text>
            </View>
            <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
              <Text style={styles.statusText}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
          <View style={styles.advanceItemDetails}>
            <View>
              <Text style={styles.advanceItemDate}>
                Requested: {new Date(item.requestedDate).toLocaleDateString()}
              </Text>
              <Text style={styles.advanceItemRepayment}>
                Repayment: KSh {item.installmentAmount.toLocaleString()} ×{" "}
                {item.repaymentPeriod} months
              </Text>
            </View>
            <View>
              <Text style={styles.totalRepaymentText}>
                Total: KSh {item.totalRepayment.toLocaleString()}
              </Text>
              <Text style={styles.interestText}>
                Interest: {item.interestRate}%
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    ),
    []
  );

  const getStatusStyle = useCallback((status: SalaryAdvance["status"]) => {
    switch (status) {
      case "pending":
        return styles.statusPending;
      case "approved":
        return styles.statusApproved;
      case "disbursed":
        return styles.statusDisbursed;
      case "repaying":
        return styles.statusRepaying;
      case "repaid":
        return styles.statusRepaid;
      default:
        return {};
    }
  }, []);

  const ListHeader = useCallback(
    () => (
      <>
        <View className="flex flex-row items-center justify-between w-[97vw] mb-5 p-4 ml-1.5">
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
            accessibilityLabel="Go back"
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Animated.Text style={[styles.headerTitle, titleStyle]}>
            Advance History
          </Animated.Text>
          <TouchableOpacity
            onPress={() => {}}
            style={styles.infoButton}
            accessibilityLabel="More information"
          ></TouchableOpacity>
        </View>
        <Animated.View style={[styles.header]}>
          <Animated.View
            style={[styles.summaryCard, { opacity: headerStyle.opacity }]}
          >
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Advances</Text>
              <Text style={styles.summaryValue}>{state.data.length}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.summaryValue}>
                KSh{" "}
                {state.data
                  .reduce((sum, item) => sum + item.amount, 0)
                  .toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Amount Repaid</Text>
              <Text style={styles.summaryValue}>
                KSh{" "}
                {state.data
                  .reduce((sum, item) => sum + item.amountRepaid, 0)
                  .toLocaleString()}
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      </>
    ),
    [headerStyle, titleStyle, state.data]
  );

  if (state.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoaderScreen
          message="Loading salary advance history..."
          backgroundColor="#1a237e"
          color="#ffffff"
          messageStyle={{ color: "#ffffff" }}
        />
      </View>
    );
  }

  if (state.error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{state.error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1a237e" translucent={true} style="light" />

      <AnimatedFlatList
        data={state.data}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffffff"
          />
        }
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        removeClippedSubviews={Platform.OS === "android"}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        ListEmptyComponent={refreshing ? <AdvanceSkeletonLoader /> : null}
        ListFooterComponent={() => {
          if (!refreshing && state.data.length === 0) {
            return (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="document-text-outline"
                  size={64}
                  color={Colors.light.secondary}
                />
                <Text style={styles.emptyText}>
                  No advance history available
                </Text>
                <Text style={styles.emptySubText}>
                  Your salary advance transactions will appear here
                </Text>
              </View>
            );
          }
          return null;
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a237e",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a237e",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a237e",
    padding: 20,
  },
  errorText: {
    color: "#ffffff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#1a237e",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#1a237e",
  },
  headerTitle: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  summaryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    color: "#ffffff",
    fontSize: 12,
    marginBottom: 5,
  },
  summaryValue: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  advanceItem: {
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
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
  advanceItemGradient: {
    padding: 15,
  },
  advanceItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  advanceItemAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  purposeText: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  statusPending: {
    backgroundColor: "#FFA000",
  },
  statusApproved: {
    backgroundColor: "#4CAF50",
  },
  statusDisbursed: {
    backgroundColor: "#2196F3",
  },
  statusRepaying: {
    backgroundColor: "#03A9F4",
  },
  statusRepaid: {
    backgroundColor: "#9C27B0",
  },
  advanceItemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  advanceItemDate: {
    fontSize: 11,
    color: "#666",
  },
  advanceItemRepayment: {
    fontSize: 11,
    color: "#666",
  },
  totalRepaymentText: {
    fontSize: 11,
    color: "#666",
  },
  interestText: {
    fontSize: 11,
    color: "#666",
  },
  skeletonContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  skeletonItem: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  skeletonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  skeletonAmount: {
    width: 120,
    height: 24,
    borderRadius: 6,
  },
  skeletonStatus: {
    width: 80,
    height: 24,
    borderRadius: 12,
  },
  skeletonDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  skeletonDate: {
    width: 100,
    height: 16,
    borderRadius: 4,
  },
  infoButton: {
    padding: 8,
  },
  loanheaderTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  backButton: {
    padding: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  emptyContainer: {
    flex: 1,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.dark.text,
    textAlign: "center",
  },
});
