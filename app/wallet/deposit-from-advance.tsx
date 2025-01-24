import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import advancesService from "@/services/advances.service";
import * as Haptics from "expo-haptics";
import AdvanceApplicationModal from "@/components/advance/AdvanceApplicationModal";
import authService from "@/services/auth.service";
import { CustomToast } from "../advance/advance-application-modal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAlert from "../../components/CustomAlert";

type PaymentMethod = "mpesa" | "wallet";

interface PaymentOption {
  id: string;
  type: PaymentMethod;
  label: string;
  number?: string;
  description?: string;
}

export default function DepositFromAdvanceScreen() {
  const [selectedMethod, setSelectedMethod] = useState<string>("1");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userPhoneNumber, setUserPhoneNumber] = useState("");
  const buttonScale = useSharedValue(1);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const [summary, setSummary] = useState(null) as any;
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    visible: boolean;
  }>({
    message: "",
    type: "success",
    visible: false,
  });

  useEffect(() => {
    fetchAdvanceSummary();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user_data");
      if (userData) {
        const user = JSON.parse(userData);
        setUserPhoneNumber(user.phoneNumber || "");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const paymentOptions: PaymentOption[] = [
    {
      id: "1",
      type: "mpesa",
      label: "M-Pesa",
      number: userPhoneNumber ? `+${userPhoneNumber}` : "Not available",
      description: "Default Account | Mobile Money",
    },
    {
      id: "2",
      type: "wallet",
      label: "Innova Wallet",
      description: "Direct to Wallet | Instant Credit",
    },
  ];

  const fetchAdvanceSummary = async () => {
    try {
      const data = await authService.getAvailableAdvance();
      setSummary(data);
    } catch (error) {
      showToast(
        "Failed to fetch advance summary. Please try again later.",
        "error"
      );
    }
  };

  const handleNext = () => {
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });
    setIsModalVisible(true);
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleAdvanceSubmit = async (data: {
    amount: number;
    purpose: string;
    repaymentPeriod: number;
    comments: string;
  }) => {
    try {
      const selectedOption = paymentOptions.find(
        (opt) => opt.id === selectedMethod
      );
      if (!selectedOption) throw new Error("Invalid payment method selected");

      await advancesService.requestAdvance({
        ...data,
        preferredPaymentMethod: selectedOption.type,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast("Advance request submitted successfully", "success");
      setTimeout(() => router.back(), 2000);
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Failed to submit advance request",
        "error"
      );
    }
  };

  const PaymentMethodOption = ({ option }: { option: PaymentOption }) => {
    const isSelected = selectedMethod === option.id;

    return (
      <TouchableOpacity
        onPress={() => setSelectedMethod(option.id)}
        style={[styles.optionCard, isSelected && styles.selectedOption]}
      >
        <View style={styles.radioContainer}>
          <View
            style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}
          >
            <View
              style={[
                styles.radioInner,
                isSelected && styles.radioInnerSelected,
              ]}
            />
          </View>
        </View>
        <View style={styles.optionInfo}>
          <Text style={styles.optionLabel}>{option.label}</Text>
          {option.description && (
            <Text style={styles.optionDescription}>
              {option.description}
              {option.number && `\n${option.number}`}
            </Text>
          )}
        </View>
        {isSelected && (
          <Ionicons
            name="chevron-forward"
            size={24}
            color="#3B82F6"
            style={styles.chevron}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1a237e" translucent={true} style="light" />

      <LinearGradient colors={["#1a237e", "#0d47a1"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Method</Text>
        <TouchableOpacity
          onPress={() => {
            setAlertTitle("Information");
            setAlertMessage(
              "Select your preferred payment method for receiving the advance amount."
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
      </LinearGradient>

      <View style={styles.content}>
        {paymentOptions.map((option) => (
          <PaymentMethodOption key={option.id} option={option} />
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleNext}>
          <Animated.View style={[styles.button, animatedButtonStyle]}>
            <LinearGradient
              colors={["#3B82F6", "#1E40AF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              <Text style={styles.buttonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </View>

      <CustomToast {...toast} />

      <View>
        <AdvanceApplicationModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSubmit={handleAdvanceSubmit}
          maxAmount={summary?.availableAdvance || 0}
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  infoButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedOption: {
    borderColor: "#3B82F6",
    backgroundColor: "#F0F9FF",
  },
  radioContainer: {
    marginRight: 12,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    borderColor: "#3B82F6",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "transparent",
  },
  radioInnerSelected: {
    backgroundColor: "#3B82F6",
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  chevron: {
    marginLeft: 12,
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  button: {
    borderRadius: 12,
    overflow: "hidden",
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
});
