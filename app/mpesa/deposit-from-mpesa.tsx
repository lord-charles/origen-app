import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MpesaService from "@/services/mpesa.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import CustomAlert from "../../components/CustomAlert";

export default function MpesaTransferScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; amount?: string }>({});
  const [walletId, setWalletId] = useState("");
  const [isFocused, setIsFocused] = useState({ phone: false, amount: false });
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const amountInputRef = useRef<TextInput>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user_data");
      if (userData) {
        const user = JSON.parse(userData);
        setWalletId(user._id);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
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
    } else if (parseFloat(amount) < 1) {
      newErrors.amount = "Minimum amount is KSh 1";
    } else if (parseFloat(amount) > 150000) {
      newErrors.amount = "Maximum amount is KSh 150,000";
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
      const response = await MpesaService.mpesaToWallet({
        phoneNumber: `254${phoneNumber}`,
        amount: parseFloat(amount),
        recipientWalletId: walletId,
      });

      if (response.success) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "STK push sent to your phone. Please complete the payment.",
        });

        setErrors({});
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response.message || "Failed to initiate transfer",
        });
      }
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Failed to process transfer",
      });
    } finally {
      setIsLoading(false);
    }
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
        <Text style={styles.headerTitle}>Deposit From M-Pesa</Text>
        <TouchableOpacity
          onPress={() => {
            setAlertTitle("Information");
            setAlertMessage(
              "This screen allows you to deposit funds from M-Pesa to your Innova wallet."
            );
            setAlertVisible(true);
          }}
          accessibilityLabel="More information"
          style={styles.infoButton}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </LinearGradient>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>M-Pesa to Wallet</Text>
          <Text style={styles.subtitle}>
            Deposit funds directly from your M-Pesa account
          </Text>

          <View style={styles.formContainer}>
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
                  ref={amountInputRef}
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
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#666"
                style={styles.noteIcon}
              />
              <Text style={styles.noteText}>
                Transaction limits: Min KSh 1, Max KSh 150,000
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleNext} disabled={isLoading}>
            <View style={styles.button}>
              <LinearGradient
                colors={["#2196F3", "#1976D2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Request Payment</Text>
                    <Ionicons name="cash-outline" size={20} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <Toast />
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
    backgroundColor: "#f8f9fa",
  },
  keyboardView: {
    flex: 1,
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
  infoButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  content: {
    padding: 24,
    flexGrow: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
  formContainer: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
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
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: "#ff5252",
  },
  inputFocused: {
    borderColor: "#2196F3",
    borderWidth: 2,
  },
  prefix: {
    fontSize: 16,
    color: "#333",
    marginRight: 8,
  },
  currency: {
    fontSize: 16,
    color: "#333",
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  errorText: {
    fontSize: 12,
    color: "#ff5252",
    marginTop: 4,
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  button: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
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
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    padding: 16,
    backgroundColor: "#e3f2fd",
    borderRadius: 12,
  },
  noteIcon: {
    marginRight: 8,
  },
  noteText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
});
