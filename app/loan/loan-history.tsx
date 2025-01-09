import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Platform,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

const HEADER_HEIGHT = 220;

const loanHistory = [
  {
    id: "1",
    amount: 50000,
    status: "Completed",
    date: "2023-05-15",
    interest: 2500,
    duration: "3 months",
  },
  {
    id: "2",
    amount: 30000,
    status: "In Progress",
    date: "2023-06-01",
    interest: 1500,
    duration: "2 months",
  },
  {
    id: "3",
    amount: 75000,
    status: "Completed",
    date: "2023-04-10",
    interest: 3750,
    duration: "6 months",
  },
  {
    id: "4",
    amount: 25000,
    status: "Overdue",
    date: "2023-03-20",
    interest: 1250,
    duration: "1 month",
  },
  {
    id: "5",
    amount: 100000,
    status: "In Progress",
    date: "2023-07-01",
    interest: 5000,
    duration: "12 months",
  },
];

export default function LoanHistoryScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useSharedValue(0);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

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

  const renderItem = useCallback(
    ({ item, index }: { item: (typeof loanHistory)[0]; index: number }) => (
      <Animated.View
        entering={FadeInRight.delay(index * 100).duration(400)}
        style={styles.loanItem}
        className="my-4"
      >
        <LinearGradient
          colors={["#ffffff", "#f8f9fa"]}
          style={styles.loanItemGradient}
        >
          <View style={styles.loanItemHeader}>
            <Text style={styles.loanAmount}>
              KSh {item.amount.toLocaleString()}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          <View style={styles.loanItemDetails}>
            <DetailRow icon="calendar-outline" text={formatDate(item.date)} />
            <DetailRow icon="time-outline" text={item.duration} />
            <DetailRow
              icon="cash-outline"
              text={`Interest: KSh ${item.interest.toLocaleString()}`}
            />
          </View>
        </LinearGradient>
      </Animated.View>
    ),
    []
  );

  const DetailRow = ({
    icon,
    text,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    text: string;
  }) => (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={16} color="#666" />
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );

  const ListHeader = () => (
    <BlurView intensity={10}>
      <LinearGradient
        colors={["#1a237e", "#1565c0"]}
        style={styles.header}
        className="pt-1 p-4"
      >
        <View className="flex flex-row items-center justify-between w-[97vw]">
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
            accessibilityLabel="Go back"
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.loanheaderTitle}>Loan History</Text>

          <TouchableOpacity
            onPress={() => {
              // TODO: Implement info modal
            }}
            style={styles.infoButton}
            accessibilityLabel="More information"
          >
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[styles.header, headerStyle]}
          className="gap-4 mt-4"
        >
          <View>
            <Text style={styles.headerTitle}>Welcome Back</Text>
            <Text style={styles.headerSubtitle}>
              Track your loan performance and history
            </Text>
          </View>
          <View style={styles.statsContainer}>
            <StatItem title="Total Loans" value="5" />
            <StatItem title="Active Loans" value="0" />
            <StatItem title="Total Amount (KSh)" value="280,000" />
          </View>
        </Animated.View>
      </LinearGradient>
    </BlurView>
  );

  const StatItem = ({ title, value }: { title: string; value: string }) => (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1a237e" translucent={true} style="light" />

      <FlatList
        data={loanHistory}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
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
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={styles.floatingButton}
      >
        <TouchableOpacity style={styles.applyButton}>
          <LinearGradient
            colors={["#4CAF50", "#45a049"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Apply for New Loan</Text>
            <Ionicons name="arrow-forward" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "#4CAF50";
    case "In Progress":
      return "#2196F3";
    case "Overdue":
      return "#FF5252";
    default:
      return "#9E9E9E";
  }
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContent: {
    paddingBottom: 100,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: "hidden",
  },
  backButton: {
    padding: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  infoButton: {
    padding: 8,
    marginRight: 10,
  },
  headerGradient: {
    flex: 1,
  },
  headerContent: {
    padding: 10,
  },
  loanheaderTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  headerTitle2: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  loanItem: {
    marginHorizontal: 16,
    marginBottom: 16,
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
  loanItemGradient: {
    padding: 16,
  },
  loanItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  loanAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  loanItemDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  applyButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
