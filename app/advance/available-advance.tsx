import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import advancesService, {
  MonthlyAdvanceSummary,
} from "@/services/advances.service";
import AdvanceTable from "./advance-table";
import AdvanceCalendar from "./advance-calendar";
import { SafeAreaView } from "react-native-safe-area-context";
import PerfectedModernCustomAlert from "../components/CustomAlert";
import CustomAlert from "@/components/CustomAlert";

const Tab = createBottomTabNavigator();

function TabBarIcon(props: {
  name: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  color: string;
}) {
  return (
    <MaterialCommunityIcons size={28} style={{ marginBottom: -3 }} {...props} />
  );
}

type AvailableAdvanceState = {
  monthData: MonthlyAdvanceSummary | null;
  isLoading: boolean;
  error: string | null;
  isModalVisible: boolean;
  alert: {
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error";
  };
};

export default function AvailableAdvanceScreen() {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [state, setState] = useState<AvailableAdvanceState>({
    monthData: null,
    isLoading: true,
    error: null,
    isModalVisible: false,
    alert: {
      visible: false,
      title: "",
      message: "",
      type: "error",
    },
  });

  useEffect(() => {
    fetchMonthlyData();
  }, []);

  const fetchMonthlyData = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const date = new Date();
      const data = await advancesService.getMonthlyAdvanceSummary(
        date.getFullYear().toString(),
        date.getMonth() + 1
      );
      setState((prev) => ({ ...prev, monthData: data }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: "Failed to fetch advance details. Please try again later.",
      }));
      console.error("Error fetching monthly advance data:", err);
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleSubmitAdvance = async (data: {
    amount: number;
    purpose: string;
    repaymentPeriod: number;
    comments: string;
  }) => {
    try {
      await advancesService.requestAdvance(data);
      setState((prev) => ({
        ...prev,
        alert: {
          visible: true,
          title: "Success",
          message: "Your advance request has been submitted successfully",
          type: "success",
        },
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        alert: {
          visible: true,
          title: "Advance Request Failed",
          message:
            error.response?.data?.message || "Failed to submit advance request",
          type: "error",
        },
      }));
    }
  };

  if (state.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (state.error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{state.error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMonthlyData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!state.monthData) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Salary Advance</Text>
        <TouchableOpacity
          onPress={() => {
            setAlertTitle("Information");
            setAlertMessage(
              "This screen shows your available salary advance limit in Table and Calendar views."
            );
            setAlertVisible(true);
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

      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#4338ca",
          tabBarInactiveTintColor: "#64748b",
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopColor: "#e2e8f0",
            height: 65,
            paddingBottom: 10,
            paddingTop: 2,
            elevation: 8,
            shadowOpacity: 0.1,
            shadowRadius: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginBottom: 4,
          },
        }}
      >
        <Tab.Screen
          name="Table"
          options={{
            tabBarLabel: "Table View",
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="table" color={color} />
            ),
          }}
        >
          {() => (
            <AdvanceTable
              monthData={state.monthData!}
              handleSubmitAdvance={handleSubmitAdvance}
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Calendar"
          options={{
            tabBarLabel: "Calendar View",
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="calendar-month" color={color} />
            ),
          }}
        >
          {() => (
            <AdvanceCalendar
              monthData={state.monthData!}
              handleSubmitAdvance={handleSubmitAdvance}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>

      <PerfectedModernCustomAlert
        visible={state.alert.visible}
        title={state.alert.title}
        message={state.alert.message}
        type={state.alert.type}
        onDismiss={() =>
          setState((prev) => ({
            ...prev,
            alert: { ...prev.alert, visible: false },
          }))
        }
      />
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        actions={[{ text: "OK", onPress: () => setAlertVisible(false) }]}
        onClose={() => setAlertVisible(false)}
        iconColor="#007AFF"
        iconName="information-circle"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1a237e",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
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
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a237e",
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    marginBottom: 16,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  retryButton: {
    backgroundColor: "#4338ca",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
