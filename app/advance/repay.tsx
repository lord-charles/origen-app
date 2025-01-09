import React, { useState, useCallback } from "react";
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
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import mpesaService from "@/services/mpesa.service";
import CustomAlert from "../../components/CustomAlert";
import { TokenService } from "@/utils/token";
import { User } from "@/services/auth.service";

// Constants
const HEADER_HEIGHT = 200;
const ITEM_HEIGHT = 120;

export default function AdvanceRepayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ repaymentBalance: string }>();
  const repaymentBalance = params.repaymentBalance
    ? Number(params.repaymentBalance)
    : 0;
  const scrollY = useSharedValue(0);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string }>();

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const validateForm = (): boolean => {
    const newErrors: { phone?: string } = {};

    if (!phoneNumber) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{9}$/.test(phoneNumber)) {
      newErrors.phone = "Invalid phone number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRepayment = async () => {
    Keyboard.dismiss();
    if (!validateForm()) return;

    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });

    setIsLoading(true);
    try {
      const user = (await TokenService.getUserData()) as User;
      await mpesaService.initiateSTKPush({
        phoneNumber: `254${phoneNumber}`,
        amount: repaymentBalance,
        accountReference: `${user.firstName}:${user._id}:repay-advance`,
      });

      setAlertTitle("Success");
      setAlertMessage(
        "Please check your phone for the M-PESA prompt and enter your PIN to complete the payment"
      );
      setAlertVisible(true);
    } catch (error: any) {
      setAlertTitle("Error");
      setAlertMessage(
        error.message ||
          "Failed to process your repayment request. Please try again."
      );
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

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
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1a237e" translucent={true} style="light" />
      <View className="flex flex-row items-center justify-between bg-[#1a237e] mb-5 p-4 ">
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
          Repay Advance
        </Animated.Text>
        <TouchableOpacity
          onPress={() => {
            setAlertTitle("Information");
            setAlertMessage(
              "This screen allows you to repay your salary advance using M-Pesa. Enter your phone number and the system will initiate an STK push for the repayment."
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
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.Text
            entering={FadeInDown.delay(200).duration(500)}
            style={styles.title}
          >
            Please Enter Your Phone Number
          </Animated.Text>

          <Animated.View
            entering={FadeInUp.delay(400).duration(500)}
            style={styles.formContainer}
          >
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors?.phone && styles.inputError,
                ]}
              >
                <Text style={styles.prefix}>+254</Text>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="7XXXXXXXX"
                  keyboardType="number-pad"
                  maxLength={9}
                  placeholderTextColor="#666"
                />
              </View>
              {errors?.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount to Repay</Text>
              <View style={[styles.inputContainer, styles.disabledInput]}>
                <Text style={styles.currency}>KSh</Text>
                <Text style={styles.input}>
                  {repaymentBalance.toLocaleString()}
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        <Animated.View
          entering={FadeInUp.delay(600).duration(500)}
          style={styles.footer}
        >
          <TouchableOpacity onPress={handleRepayment} disabled={isLoading}>
            <Animated.View style={[styles.button, animatedButtonStyle]}>
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
                    <Text style={styles.buttonText}>Repay Now</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
      <View>
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
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 16,
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 24,
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
  },
  disabledInput: {
    backgroundColor: "#f5f5f5",
  },
  inputError: {
    borderColor: "#ff5252",
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
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginRight: 8,
  },
});
