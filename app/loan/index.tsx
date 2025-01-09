import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

const metrics = [
  {
    id: "1",
    title: "Loan Requested",
    amount: 0,
    color: "#2196F3",
    icon: "cash-outline" as keyof typeof Ionicons.glyphMap,
  },
  {
    id: "2",
    title: "Total Interest",
    amount: 0,
    color: "#4CAF50",
    icon: "trending-up-outline" as keyof typeof Ionicons.glyphMap,
  },
  {
    id: "3",
    title: "Loan Repaid",
    amount: 0,
    color: "#9C27B0",
    icon: "checkmark-circle-outline" as keyof typeof Ionicons.glyphMap,
  },
  {
    id: "4",
    title: "Remaining Amount",
    amount: 0,
    color: "#FF5252",
    icon: "time-outline" as keyof typeof Ionicons.glyphMap,
  },
] as const;

const loanHistory = [
  {
    id: "1",
    amount: 25000,
    status: "Completed",
    date: "2023-05-15",
    interest: 1250,
  },
  {
    id: "2",
    amount: 15000,
    status: "In Progress",
    date: "2023-06-01",
    interest: 750,
  },
];

export default function PersonalLoanScreen() {
  const [showHistory, setShowHistory] = useState(false);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const MetricCard = ({
    title,
    amount,
    color,
    icon,
  }: {
    title: string;
    amount: number;
    color: string;
    icon: keyof typeof Ionicons.glyphMap;
  }) => (
    <Animated.View
      entering={FadeInDown.delay(200).duration(700)}
      style={[styles.metricCard, { borderLeftColor: color }]}
    >
      <View style={styles.metricHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={styles.metricAmount}>KSh {amount.toLocaleString()}</Text>
    </Animated.View>
  );

  const HistoryItem = ({
    amount,
    status,
    date,
    interest,
  }: {
    amount: number;
    status: string;
    date: string;
    interest: number;
  }) => (
    <View style={styles.historyItem}>
      <LinearGradient
        colors={["#f8f9fa", "#ffffff"]}
        style={styles.historyGradient}
      >
        <View style={styles.historyHeader}>
          <Text style={styles.historyAmount}>
            KSh {amount.toLocaleString()}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: status === "Completed" ? "#4CAF50" : "#2196F3",
              },
            ]}
          >
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>
        <View style={styles.historyDetails}>
          <Text style={styles.historyDate}>
            {new Date(date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <Text style={styles.historyInterest}>
            Interest: KSh {interest.toLocaleString()}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#2E1D6D", "#1A1035"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Loan</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <View style={styles.metricsGrid}>
          {metrics.map((metric) => (
            <MetricCard key={metric.id} {...metric} />
          ))}
        </View>

        <View style={styles.emptyStateContainer}>
          <Animated.View
            entering={FadeInUp.delay(400).duration(700)}
            style={styles.emptyState}
          >
            <Ionicons name="document-text-outline" size={48} color="#bbb" />
            <Text style={styles.emptyStateText}>
              No loan has been taken yet
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Take your first loan to start building your credit history
            </Text>
          </Animated.View>
        </View>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push("/loan/loan-history")}
        >
          <Ionicons name="calendar-outline" size={24} color="#fff" />
          <Text style={styles.historyText}>View My Loan History</Text>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>

        {showHistory && (
          <Animated.View
            entering={FadeInDown.duration(700)}
            style={styles.historyContainer}
          >
            {loanHistory.map((loan) => (
              <HistoryItem key={loan.id} {...loan} />
            ))}
          </Animated.View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity style={styles.takeLoanButton}>
            <LinearGradient
              colors={["#2196F3", "#1976D2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Take Loan</Text>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  infoButton: {
    padding: 8,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 16,
  },
  metricCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
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
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  metricAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  emptyStateContainer: {
    alignItems: "center",
    padding: 32,
  },
  emptyState: {
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  historyText: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 15,
    marginBottom: 30,
  },
  historyContainer: {
    padding: 16,
  },
  historyItem: {
    marginBottom: 16,
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
  historyGradient: {
    padding: 16,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  historyAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  historyDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  historyDate: {
    fontSize: 14,
    color: "#666",
  },
  historyInterest: {
    fontSize: 14,
    color: "#666",
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  takeLoanButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
