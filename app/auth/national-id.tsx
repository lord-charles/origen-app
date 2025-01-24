import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Text } from "react-native-paper";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import AuthService, { User } from "@/services/auth.service";
import Toast from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";

const MIN_ID_LENGTH = 7;
const MAX_ID_LENGTH = 8;

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const [nationalId, setNationalId] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState("");
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const userData = (await AuthService.getTempUserData()) as User;
      if (userData?.nationalId) {
        if (isValidNationalId(userData.nationalId)) {
          setNationalId(userData.nationalId);
        }
      }
    } catch (error) {
      console.error("Error checking session:", error);
    }
  };

  const isValidNationalId = (id: string): boolean => {
    // Check if the ID contains only numbers
    const numbersOnly = /^\d+$/.test(id);
    // Check length
    const validLength =
      id.length >= MIN_ID_LENGTH && id.length <= MAX_ID_LENGTH;
    return numbersOnly && validLength;
  };

  const handleNationalIdChange = (value: string) => {
    // Only allow numbers
    const numbersOnly = value.replace(/[^0-9]/g, "");
    setNationalId(numbersOnly);

    // Clear error when user starts typing
    if (inputError) setInputError("");
  };

  const validateInput = (): boolean => {
    if (!nationalId) {
      setInputError("Please enter your National ID");
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter your National ID",
      });
      return false;
    }

    if (!isValidNationalId(nationalId)) {
      const errorMessage = "National ID must be 7-8 digits";
      setInputError(errorMessage);
      Toast.show({
        type: "error",
        text1: "Invalid National ID",
        text2: errorMessage,
      });
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    if (!validateInput()) return;

    try {
      setLoading(true);
      const { error } = await AuthService.findUserByNationalId(nationalId);

      if (error === "not_found") {
        Toast.show({
          type: "error",
          text1: "User Not Found",
          text2: "No account found with this National ID",
        });
        router.push("/auth/no-company-found");
        return;
      }

      if (error === "server_error") {
        throw new Error("Failed to verify National ID");
      }

      // Toast.show({
      //   type: "success",
      //   text1: "Success",
      //   text2: "Please enter your PIN to continue",
      // });

      router.push("/auth/otp");
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style="auto" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 60}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            <Animated.View
              entering={FadeInDown.delay(200)}
              style={styles.logoContainer}
            >
              <Image
                source={require("../../assets/images/innova-logo1.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </Animated.View>

            {/* Illustration */}
            <View style={styles.illustrationContainer}>
              <Image
                source={require("../../assets/images/ID-Card2.png")}
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
                Let's Get Started
              </Text>
              <Text style={[{ color: theme.secondary }]} variant="titleMedium">
                Please enter your national identity number
              </Text>
            </View>

            <View className="w-full">
              {/* Input Section */}
              <View>
                <View
                  style={[
                    styles.inputContainer,
                    { backgroundColor: theme.card },
                    inputError && styles.inputError,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={24}
                    color={inputError ? "#ef4444" : theme.icon}
                    style={styles.icon}
                  />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Enter your National ID"
                    placeholderTextColor={theme.secondary}
                    keyboardType="numeric"
                    value={nationalId}
                    onChangeText={handleNationalIdChange}
                    maxLength={MAX_ID_LENGTH}
                    editable={!loading}
                  />
                </View>
                {inputError ? (
                  <Text style={styles.errorText}>{inputError}</Text>
                ) : (
                  <Text style={styles.helperText}>
                    National ID should be {MIN_ID_LENGTH}-{MAX_ID_LENGTH} digits
                  </Text>
                )}
              </View>

              {/* Button Section */}
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: theme.primary },
                  loading && styles.disabledButton,
                ]}
                className="flex-row items-center gap-x-2 justify-center"
                onPress={handleNext}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Text
                      style={{ fontFamily: "RobotoBold", color: "white" }}
                      variant="headlineSmall"
                    >
                      Next
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
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: Platform.OS === "ios" ? 40 : 80,
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 220,
    height: 70,
    resizeMode: "contain",
  },
  illustrationContainer: {
    alignItems: "center",
  },
  illustration: {
    width: 250,
    height: 250,
    resizeMode: "contain",
  },
  textContainer: {
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Roboto",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: "Roboto",
  },
  helperText: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: "Roboto",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: "100%",
  },
  disabledButton: {
    opacity: 0.7,
  },
});
