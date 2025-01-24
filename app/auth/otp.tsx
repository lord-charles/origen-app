import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Platform,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Text } from "react-native-paper";
import { router } from "expo-router";
import { OtpInput } from "react-native-otp-entry";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthService, { User } from "@/services/auth.service";
import Toast from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";

export default function OTPScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;
  const [loading, setLoading] = useState(false);
  const [nationalId, setNationalId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [pin, setPin] = useState<string>("");
  const otpRef = useRef<any>(null);

  useEffect(() => {
    loadNationalId();
  }, []);

  const loadNationalId = async () => {
    try {
      const userData = (await AuthService.getTempUserData()) as User;
      if (!userData) {
        Toast.show({
          type: "error",
          text1: "Session Expired",
          text2: "Please enter your National ID again",
        });
        router.replace("/auth/national-id");
        return;
      }

      setNationalId(userData.nationalId);
      setUserName(userData.firstName || "User");
    } catch (error) {
      console.error("Error loading user details:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load user details",
      });
      router.replace("/auth/national-id");
    }
  };

  const resetPin = () => {
    setPin("");
    if (otpRef.current?.clear) {
      otpRef.current.clear();
    }
  };

  const handleLogin = async (enteredPin: string) => {
    if (!nationalId) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "National ID not found. Please try again.",
      });
      router.replace("/auth/national-id");
      return;
    }

    try {
      setLoading(true);
      const response = await AuthService.login(nationalId, enteredPin);

      // Clear temporary storage
      await AsyncStorage.removeItem("temp_user_data");

      Toast.show({
        type: "success",
        text1: "Welcome Back!",
        text2: `Successfully logged in as ${response.user.firstName}`,
      });

      // Navigate to home screen
      setTimeout(() => {
        router.replace("/home");
      }, 500);
    } catch (error: any) {
      // Reset PIN on invalid credentials
      resetPin();
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2:
          error.response?.data?.message ||
          "Invalid credentials. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPress = () => {
    if (pin.length === 4) {
      handleLogin(pin);
    } else {
      Toast.show({
        type: "error",
        text1: "Invalid PIN",
        text2: "Please enter a 4-digit PIN",
      });
    }
  };

  const handleForgotPin = () => {
    Toast.show({
      type: "info",
      text1: "Reset PIN",
      text2: "Please contact your administrator to reset your PIN",
    });
  };

  const handlePinChange = (text: string) => {
    setPin(text);
    if (text.length === 4) {
      handleLogin(text);
    }
  };

  const dynamicStyles = {
    focusStick: {
      width: 2,
      height: 20,
      backgroundColor: theme.primary,
    },
    activePinCodeContainer: {
      borderColor: theme.primary,
      borderWidth: 1,
    },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style="auto" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 40}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { backgroundColor: theme.background },
            { flexGrow: 1 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View>
            <Image
              source={require("../../assets/images/innova-logo1.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <Image
              source={require("../../assets/images/OTP-cuate2.png")}
              style={styles.illustration}
            />
          </View>

          {/* Text Section */}
          <View style={styles.textContainer}>
            <Text
              className="font-bold"
              style={{ fontFamily: "SpaceMono" }}
              variant="headlineLarge"
            >
              Hi {userName}
            </Text>
            <Text style={[{ color: theme.secondary }]} variant="titleMedium">
              Please enter your 4-digit PIN to continue
            </Text>
          </View>

          <View className="w-full gap-y-2">
            <View className="relative">
              {/* OTP Input Section */}
              <View style={styles.otpContainer}>
                <OtpInput
                  ref={otpRef}
                  numberOfDigits={4}
                  focusColor={theme.primary}
                  focusStickBlinkingDuration={500}
                  onTextChange={handlePinChange}
                  secureTextEntry
                  disabled={loading}
                  textInputProps={{
                    accessibilityLabel: "PIN",
                  }}
                  theme={{
                    containerStyle: styles.container,
                    pinCodeContainerStyle: [
                      styles.pinCodeContainer,
                      { backgroundColor: theme.card },
                    ],
                    pinCodeTextStyle: [
                      styles.pinCodeText,
                      { color: theme.text },
                    ],
                    focusStickStyle: dynamicStyles.focusStick,
                    focusedPinCodeContainerStyle:
                      dynamicStyles.activePinCodeContainer,
                  }}
                />
              </View>
              <TouchableOpacity
                className="absolute bottom-[20px] left-[80%] pt-3"
                onPress={handleForgotPin}
              >
                <Text style={{ color: theme.secondary }} variant="bodySmall">
                  Forgot PIN?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Button Section */}
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: theme.primary },
                loading && styles.disabledButton,
                (!pin || pin.length !== 4) && styles.disabledButton,
              ]}
              className="flex-row items-center gap-x-2 justify-center"
              onPress={handleVerifyPress}
              disabled={loading || !pin || pin.length !== 4}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text
                    style={{ fontFamily: "RobotoBold", color: "white" }}
                    variant="headlineSmall"
                  >
                    Verify
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={24}
                    color="white"
                    className="mt-1"
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: Platform.OS === "ios" ? 40 : 50,
  },
  logo: {
    width: 220,
    height: 70,
    resizeMode: "contain",
  },
  textContainer: {
    marginTop: 0,
    alignItems: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 2,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0,
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: "100%",
  },
  disabledButton: {
    opacity: 0.5,
  },
  pinCodeContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  pinCodeText: {
    fontSize: 24,
    textAlign: "center",
  },
  illustrationContainer: {
    alignItems: "center",
  },
  illustration: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
});
