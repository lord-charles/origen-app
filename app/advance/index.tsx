import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  RefreshControl,
  Pressable,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthService from "../../services/auth.service";
import AdvanceApplicationModal from "@/components/advance/AdvanceApplicationModal";
import advancesService from "@/services/advances.service";
import CustomAlert from "../components/CustomAlert";

interface MetricProps {
  label: string;
  amount: number;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function SalaryAdvanceScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState(null) as any;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    type: "success" | "error";
  }>({
    title: "",
    message: "",
    type: "error",
  });

  const fetchAdvanceSummary = async () => {
    try {
      const data = await AuthService.getAvailableAdvance();
      setSummary(data);
    } catch (error) {
      setAlertConfig({
        title: "Error",
        message: "Failed to fetch advance summary. Please try again later.",
        type: "error",
      });
      setAlertVisible(true);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAdvanceSummary();
    setRefreshing(false);
  }, []);

  React.useEffect(() => {
    fetchAdvanceSummary();
  }, []);

  const metrics: MetricProps[] = [
    {
      label: "Advance Received",
      amount: summary?.previousAdvances || 0,
      color: "#4CAF50",
      icon: "cash-outline",
    },
    {
      label: "Amount Repaid",
      amount: summary?.totalAmountRepaid || 0,
      color: "#FF9800",
      icon: "checkmark-circle-outline",
    },
    {
      label: "Repay Balance",
      amount: summary?.repaymentBalance || 0,
      color: "#F44336",
      icon: "time-outline",
    },
  ];

  const handleGetAdvance = () => {
    setIsModalVisible(true);
  };

  const handleSubmitAdvance = async (data: {
    amount: number;
    purpose: string;
    repaymentPeriod: number;
    comments: string;
  }) => {
    try {
      await advancesService.requestAdvance(data);
      fetchAdvanceSummary();
      setAlertConfig({
        title: "Success",
        message: "Your advance request has been submitted successfully",
        type: "success",
      });
      setAlertVisible(true);
    } catch (error: any) {
      setAlertConfig({
        title: "Advance Request Failed",
        message:
          error.response?.data?.message || "Failed to submit advance request",
        type: "error",
      });
      setAlertVisible(true);
    }
  };

  const Metric = ({ label, amount, color, icon }: MetricProps) => (
    <View style={styles.metricContainer}>
      <View style={[styles.metricIconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="white" />
      </View>
      <View>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricAmount}>KSh {amount.toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1a237e" translucent={true} style="light" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Salary Advance</Text>
        <Pressable onPress={() => router.push("/advance/available-advance")}>
          {({ pressed }) => (
            <View style={[styles.infoButton, pressed && { opacity: 0.85 }]}>
              <Ionicons
                name="ellipsis-horizontal-circle-outline"
                size={26}
                color="#FFFFFF"
              />
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Pressable onPress={() => router.push("/advance/available-advance")}>
          {({ pressed }) => (
            <View style={[styles.mainCard, pressed && { opacity: 0.85 }]}>
              <LinearGradient
                colors={["#1a237e", "#3949ab"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBackground}
              >
                <Text style={styles.availableLabel}>Available Advance</Text>
                <Text style={styles.availableAmount}>
                  KSh {summary?.availableAdvance.toLocaleString() || "0"}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.getAdvanceButton,
                    !summary?.availableAdvance &&
                      styles.getAdvanceButtonDisabled,
                  ]}
                  onPress={handleGetAdvance}
                  disabled={isLoading || !summary?.availableAdvance}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <Ionicons
                        name="reload"
                        size={24}
                        color="#1a237e"
                        style={styles.loadingIcon}
                      />
                      <Text style={styles.loadingText}>Processing...</Text>
                    </View>
                  ) : (
                    <Text style={styles.getAdvanceButtonText}>Get Advance</Text>
                  )}
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}
        </Pressable>

        <View style={styles.metricsContainer}>
          {metrics.map((metric, index) => (
            <View key={metric.label}>
              <Metric {...metric} />
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => {
            router.push("/advance/advance-history");
          }}
          accessibilityLabel="View advance history"
        >
          <Ionicons name="calendar-outline" size={24} color="#1a237e" />
          <Text style={styles.historyButtonText}>View Advance History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.repayButton,
            !summary?.repaymentBalance && styles.repayButtonDisabled,
          ]}
          onPress={() => {
            router.push({
              pathname: "/advance/repay",
              params: { repaymentBalance: summary?.repaymentBalance },
            });
          }}
          disabled={!summary?.repaymentBalance}
          accessibilityLabel="Repay salary advance"
        >
          <Text style={styles.repayButtonText}>Repay Advance</Text>
        </TouchableOpacity>
      </ScrollView>

      <AdvanceApplicationModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleSubmitAdvance}
        maxAmount={summary?.availableAdvance || 0}
      />
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onDismiss={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1a237e",
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
    color: "#FFFFFF",
  },
  infoButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  mainCard: {
    margin: 16,
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
  gradientBackground: {
    padding: 24,
    alignItems: "center",
  },
  availableLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.8,
    marginBottom: 8,
  },
  availableAmount: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 24,
  },
  getAdvanceButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    minWidth: 200,
    alignItems: "center",
  },
  getAdvanceButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  getAdvanceButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a237e",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingIcon: {
    marginRight: 8,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a237e",
  },
  metricsContainer: {
    padding: 16,
  },
  metricContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  metricLabel: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 4,
  },
  metricAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a237e",
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8EAF6",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a237e",
    marginLeft: 8,
  },
  repayButton: {
    backgroundColor: "#1a237e",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 32,
    alignItems: "center",
  },
  repayButtonDisabled: {
    backgroundColor: "#9FA8DA",
  },
  repayButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
