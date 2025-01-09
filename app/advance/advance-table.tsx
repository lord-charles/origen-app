import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { format, parseISO, isFuture } from "date-fns";
import { router } from "expo-router";
import { MonthlyAdvanceSummary } from "@/services/advances.service";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AdvanceApplicationModal from "./advance-application-modal";

interface AdvanceTableProps {
  monthData: MonthlyAdvanceSummary;
  handleSubmitAdvance: (data: {
    amount: number;
    purpose: string;
    repaymentPeriod: number;
    comments: string;
  }) => void;
}

export default function AdvanceTable({
  monthData,
  handleSubmitAdvance,
}: AdvanceTableProps) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(0);

  const handleAdvanceRequest = (date: string) => {
    const dayData = monthData?.dailyAdvances.find((day) => day.date === date);
    if (dayData) {
      setSelectedAmount(dayData.availableAmount);
      setIsModalVisible(true);
    }
  };

  const renderTableHeader = () => (
    <Animated.View
      style={[
        styles.tableHeader,
        {
          opacity: scrollY.interpolate({
            inputRange: [0, 50],
            outputRange: [1, 0.9],
            extrapolate: "clamp",
          }),
          transform: [
            {
              translateY: scrollY.interpolate({
                inputRange: [0, 100],
                outputRange: [0, -50],
                extrapolate: "clamp",
              }),
            },
          ],
        },
      ]}
    >
      <Text style={[styles.headerCell, { flex: 1.2 }]}>Date</Text>
      <Text style={[styles.headerCell, { flex: 1 }]}>Day</Text>
      <Text style={[styles.headerCell, { flex: 1.5 }]}>Amount</Text>
      <Text style={[styles.headerCell, { flex: 0.8 }]}>%</Text>
      <Text style={[styles.headerCell, { flex: 1 }]}>Action</Text>
    </Animated.View>
  );

  const renderTableRow = (day: MonthlyAdvanceSummary["dailyAdvances"][0]) => {
    const date = parseISO(day.date);
    const dayName = format(date, "EEE");
    const dateStr = format(date, "d MMM");

    return (
      <View
        key={day.date}
        style={[styles.tableRow, day.isWeekend && styles.weekendRow]}
      >
        <View style={[styles.cell, { flex: 1.2 }]}>
          <Text style={{ fontSize: 14, color: "#1e293b" }}>{dateStr}</Text>
        </View>
        <View style={[styles.cell, { flex: 1 }]}>
          <Text style={{ fontSize: 14, color: "#1e293b" }}>{dayName}</Text>
        </View>
        <View style={[styles.cell, { flex: 1.5 }]}>
          <Text style={{ fontSize: 14, color: "#1e293b" }}>
            KSh {day.availableAmount.toLocaleString()}
          </Text>
        </View>
        <View style={[styles.cell, { flex: 0.8 }]}>
          <Text style={{ fontSize: 14, color: "#1e293b" }}>
            {day.percentageOfSalary.toFixed(1)}%
          </Text>
        </View>
        <View style={[styles.cell, { flex: 1 }]}>
          <TouchableOpacity
            style={[
              styles.applyButton,
              (day.availableAmount === 0 || isFuture(parseISO(day.date))) &&
                styles.disabledButton,
            ]}
            onPress={() => handleAdvanceRequest(day.date)}
            disabled={day.availableAmount === 0 || isFuture(parseISO(day.date))}
          >
            <Text style={styles.applyButtonText}>
              {day.availableAmount === 0
                ? "N/A"
                : isFuture(parseISO(day.date))
                ? "Future"
                : "Apply"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4338ca", "#3730a3"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.summaryCard}
      >
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons
            name="cash"
            size={24}
            color="#ffffff"
            style={styles.summaryIcon}
          />
          <Text style={styles.summaryLabel}>Basic Salary</Text>
          <Text style={styles.summaryValue}>
            KSh {monthData.basicSalary.toLocaleString()}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons
            name="percent"
            size={24}
            color="#ffffff"
            style={styles.summaryIcon}
          />
          <Text style={styles.summaryLabel}>Max Advance</Text>
          <Text style={styles.summaryValue}>
            {monthData.maxAdvancePercentage.toFixed(2)}%
          </Text>
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={styles.tableScroll}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {renderTableHeader()}
        {monthData.dailyAdvances.map(renderTableRow)}
      </Animated.ScrollView>
      <AdvanceApplicationModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleSubmitAdvance}
        maxAmount={selectedAmount}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8fafc",
  },
  summaryCard: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#4338ca",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryIcon: {
    marginBottom: 8,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 20,
  },
  summaryLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  tableScroll: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tableHeader: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#f1f5f9",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerCell: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    alignItems: "center",
  },
  weekendRow: {
    backgroundColor: "#f8fafc",
  },
  cell: {
    flex: 1,
  },
  applyButton: {
    backgroundColor: "#4338ca",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#cbd5e1",
  },
  applyButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
});
