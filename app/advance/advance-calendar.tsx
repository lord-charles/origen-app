import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format, isFuture, parseISO } from "date-fns";
import { MonthlyAdvanceSummary } from "@/services/advances.service";
import AdvanceApplicationModal from "./advance-application-modal";

interface AdvanceCalendarProps {
  monthData: MonthlyAdvanceSummary;
  handleSubmitAdvance: (data: {
    amount: number;
    purpose: string;
    repaymentPeriod: number;
    comments: string;
  }) => Promise<void>;
}

export default function AdvanceCalendar({
  monthData,
  handleSubmitAdvance,
}: AdvanceCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [isModalVisible, setIsModalVisible] = useState(false);

  const getMarkedDates = () => {
    const marked: any = {};
    monthData.dailyAdvances.forEach((day) => {
      marked[day.date] = {
        marked: true,
        dotColor: day.isWeekend ? "#cbd5e1" : "#4338ca",
        selected: day.date === selectedDate,
        selectedColor: "#4338ca",
      };
    });
    return marked;
  };

  const selectedDayData = monthData.dailyAdvances.find(
    (day) => day.date === selectedDate
  );

  return (
    <ScrollView style={styles.content}>
      <View style={styles.calendarContainer}>
        <Calendar
          current={selectedDate}
          onDayPress={(day: any) => setSelectedDate(day.dateString)}
          markedDates={getMarkedDates()}
          theme={{
            backgroundColor: "#ffffff",
            calendarBackground: "#ffffff",
            selectedDayBackgroundColor: "#4338ca",
            selectedDayTextColor: "#ffffff",
            todayTextColor: "#4338ca",
            dayTextColor: "#1e293b",
            textDisabledColor: "#94a3b8",
            dotColor: "#4338ca",
            monthTextColor: "#1e293b",
            textDayFontFamily: "System",
            textMonthFontFamily: "System",
            textDayHeaderFontFamily: "System",
            textDayFontSize: 14,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 14,
          }}
        />
      </View>

      {selectedDayData && (
        <View style={styles.detailsContainer}>
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Available Advance</Text>
            <Text style={styles.amountValue}>
              KSh {selectedDayData.availableAmount.toLocaleString()}
            </Text>
            <Text style={styles.percentageText}>
              {selectedDayData.percentageOfSalary.toFixed(1)}% of your salary
            </Text>
            <TouchableOpacity
              style={[
                styles.advanceButton,
                {
                  opacity:
                    selectedDayData.availableAmount === 0 ||
                    isFuture(parseISO(selectedDate))
                      ? 0.5
                      : 1,
                },
              ]}
              disabled={
                selectedDayData.availableAmount === 0 ||
                isFuture(parseISO(selectedDate))
              }
              onPress={() => setIsModalVisible(true)}
            >
              <Text style={styles.buttonText}>
                {selectedDayData.availableAmount === 0
                  ? "No Advance Available"
                  : isFuture(parseISO(selectedDate))
                  ? "Not Available for Future Dates"
                  : "Get Advance"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoCard}>
              <MaterialCommunityIcons name="cash" size={24} color="#22c55e" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Basic Salary</Text>
                <Text style={styles.infoValue}>
                  KSh {monthData.basicSalary.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <MaterialCommunityIcons
                name="percent"
                size={24}
                color="#4338ca"
              />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Max Advance</Text>
                <Text style={styles.infoValue}>
                  {monthData.maxAdvancePercentage.toFixed(2)}%
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
      <AdvanceApplicationModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleSubmitAdvance}
        maxAmount={selectedDayData?.availableAmount || 0}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  calendarContainer: {
    backgroundColor: "#ffffff",
    margin: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsContainer: {
    padding: 16,
  },
  amountCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  amountLabel: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  percentageText: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
  },
  advanceButton: {
    backgroundColor: "#4338ca",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  infoContainer: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTextContainer: {
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
});
