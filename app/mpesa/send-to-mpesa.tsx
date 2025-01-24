import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Contacts from "expo-contacts";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MpesaService from "@/services/mpesa.service";
import * as Haptics from "expo-haptics";
import authService from "@/services/auth.service";
import PerfectedModernCustomAlert from "@/app/components/CustomAlert";
import CustomAlert from "../../components/CustomAlert";

export default function MpesaTransferScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; amount?: string }>({});
  const [isFocused, setIsFocused] = useState({ phone: false, amount: false });
  const [walletBalance, setWalletBalance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
  });
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "info" | "warning" = "info"
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
    });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const fetchBalance = async () => {
    try {
      const balance = await authService.getWalletBalance();
      setWalletBalance(balance);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      showAlert("Error", "Failed to fetch wallet balance", "error");
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBalance();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchBalance();
    }, [])
  );

  const pickContact = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const contact = await Contacts.presentContactPickerAsync();

        if (contact?.phoneNumbers?.[0]?.number) {
          const number = contact.phoneNumbers[0].number.replace(/\D/g, "");
          if (number.startsWith("254")) {
            setPhoneNumber(number.substring(3));
          } else if (number.startsWith("+254")) {
            setPhoneNumber(number.substring(4));
          } else if (number.startsWith("0")) {
            setPhoneNumber(number.substring(1));
          } else if (number.length >= 9) {
            setPhoneNumber(number.slice(-9));
          }
        } else {
          showAlert(
            "Invalid Contact",
            "Selected contact does not have a phone number",
            "warning"
          );
        }
      } else {
        showAlert(
          "Permission Required",
          "Please allow access to contacts in your phone settings to use this feature",
          "warning"
        );
      }
    } catch (error) {
      console.error("Error accessing contacts:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showAlert(
        "Error",
        "Failed to access contacts. Please try again.",
        "error"
      );
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { phone?: string; amount?: string } = {};

    if (!phoneNumber) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{9}$/.test(phoneNumber)) {
      newErrors.phone = "Invalid phone number format";
    }

    if (!amount) {
      newErrors.amount = "Amount is required";
    } else {
      const numAmount = parseFloat(amount);
      if (numAmount < 10) {
        newErrors.amount = "Minimum withdrawal amount is KSh 10";
      } else if (numAmount > 150000) {
        newErrors.amount = "Maximum withdrawal amount is KSh 150,000";
      } else if (numAmount > walletBalance) {
        newErrors.amount = "Insufficient wallet balance";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    Keyboard.dismiss();
    if (!validateForm()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    try {
      const response = await MpesaService.initiateB2CTransfer({
        phoneNumber: `254${phoneNumber}`,
        amount: parseFloat(amount),
      });

      if (response.success) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        showAlert(
          "Success",
          "Your withdrawal request has been initiated",
          "success"
        );
        setErrors({});
        setPhoneNumber("");
        setAmount("");
        await fetchBalance();
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        showAlert(
          "Error",
          response.message || "Failed to initiate withdrawal",
          "error"
        );
      }
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showAlert(
        "Error",
        error.response?.data?.message || "Failed to process withdrawal",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1a237e" translucent={true} style="light" />
      <LinearGradient colors={["#1a237e", "#0d47a1"]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Withdraw to M-Pesa</Text>
          <TouchableOpacity
            onPress={() => {
              setAlertTitle("Information");
              setAlertMessage(
                "This screen allows you to withdraw funds from your Innova wallet to M-Pesa."
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
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.formContainer}>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>
                KSh {walletBalance.toLocaleString()}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.phone && styles.inputError,
                  isFocused.phone && styles.inputFocused,
                ]}
              >
                <Text style={styles.prefix}>+254</Text>
                <TextInput
                  style={styles.input}
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setPhoneNumber(text);
                    if (errors.phone) {
                      setErrors((prev) => ({ ...prev, phone: undefined }));
                    }
                  }}
                  onFocus={() =>
                    setIsFocused((prev) => ({ ...prev, phone: true }))
                  }
                  onBlur={() =>
                    setIsFocused((prev) => ({ ...prev, phone: false }))
                  }
                  placeholder="7XXXXXXXX"
                  keyboardType="number-pad"
                  maxLength={9}
                  placeholderTextColor="#666"
                />
                <TouchableOpacity
                  onPress={pickContact}
                  style={styles.contactButton}
                >
                  <Ionicons name="people" size={20} color="#3B82F6" />
                </TouchableOpacity>
              </View>
              {errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.amount && styles.inputError,
                  isFocused.amount && styles.inputFocused,
                ]}
              >
                <Text style={styles.currency}>KSh</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={(text) => {
                    setAmount(text);
                    if (errors.amount) {
                      setErrors((prev) => ({ ...prev, amount: undefined }));
                    }
                  }}
                  onFocus={() =>
                    setIsFocused((prev) => ({ ...prev, amount: true }))
                  }
                  onBlur={() =>
                    setIsFocused((prev) => ({ ...prev, amount: false }))
                  }
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  maxLength={10}
                  placeholderTextColor="#666"
                />
              </View>
              {errors.amount && (
                <Text style={styles.errorText}>{errors.amount}</Text>
              )}
            </View>

            <View style={styles.noteContainer}>
              <Text style={styles.noteText}>
                Note: Withdrawal limits - Min: KSh 10, Max: KSh 150,000
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleNext} disabled={isLoading}>
            <View style={styles.button}>
              <LinearGradient
                colors={["#3B82F6", "#1E40AF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Withdraw</Text>
                    <Ionicons name="cash-outline" size={20} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <PerfectedModernCustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onDismiss={hideAlert}
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
    backgroundColor: "#F3F4F6",
  },
  header: {
    paddingTop: Platform.OS === "android" ? 20 : 0,
  },
  headerContent: {
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
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  formContainer: {
    gap: 24,
  },
  balanceContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E40AF",
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  inputFocused: {
    borderColor: "#3B82F6",
    borderWidth: 2,
  },
  prefix: {
    fontSize: 16,
    color: "#4B5563",
    marginRight: 8,
  },
  currency: {
    fontSize: 16,
    color: "#4B5563",
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  contactButton: {
    padding: 8,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  noteContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#E0F2FE",
    borderRadius: 12,
  },
  noteText: {
    fontSize: 14,
    color: "#1E40AF",
    textAlign: "center",
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
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
    marginRight: 8,
  },
});
