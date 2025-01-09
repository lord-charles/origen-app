import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Dimensions,
  TextInput,
  Alert,
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
} from "react-native-reanimated";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

type Service = "buyGoods" | "payBills";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function BuyGoodsPayBillsScreen() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [inputNumber, setInputNumber] = useState("");
  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const handleServicePress = (service: Service) => {
    setSelectedService(service);
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });
  };

  const validateNumber = () => {
    if (!inputNumber.trim()) {
      Alert.alert("Error", "Please enter a number");
      return false;
    }

    const number = inputNumber.trim();
    if (selectedService === "buyGoods") {
      // Till numbers are 6 digits
      if (!/^\d{6}$/.test(number)) {
        Alert.alert("Error", "Till number must be exactly 6 digits");
        return false;
      }
    } else {
      // Paybill numbers are 6-7 digits
      if (!/^\d{6,7}$/.test(number)) {
        Alert.alert("Error", "Paybill number must be 6 or 7 digits");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateNumber()) {
      // Proceed with the transaction
      Alert.alert("Success", `Proceeding with ${selectedService} transaction`);
      // Add your transaction logic here
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1a237e" translucent={true} style="light" />
      <LinearGradient colors={["#1a237e", "#0d47a1"]}>
        <View className="flex flex-row items-center justify-between w-[97vw]  p-4 ml-1.5">
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
            accessibilityLabel="Go back"
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Animated.Text style={[styles.headerTitle]}>
            Buy Goods | Pay Bill
          </Animated.Text>
          <TouchableOpacity
            onPress={() => {
              // TODO: Implement info modal
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

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.Text
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.sectionTitle}
        >
          Please Select Service
        </Animated.Text>
        <View style={styles.serviceCardContainer}>
          <Animated.View
            entering={FadeInUp.delay(500).duration(500)}
            style={styles.serviceCard}
          >
            <LinearGradient
              colors={["#ffffff", "#f8f9fa"]}
              style={styles.serviceGradient}
            >
              <AnimatedTouchable
                style={[
                  styles.serviceButton,
                  animatedButtonStyle,
                  selectedService === "buyGoods" && styles.selectedService,
                ]}
                onPress={() => handleServicePress("buyGoods")}
              >
                <View
                  style={[
                    styles.iconBackground,
                    { backgroundColor: "rgba(33, 150, 243, 0.1)" },
                  ]}
                >
                  <Ionicons name="cart-outline" size={32} color="#2196F3" />
                </View>
                <Text style={styles.serviceText}>Buy Goods</Text>
              </AnimatedTouchable>
              <AnimatedTouchable
                style={[
                  styles.serviceButton,
                  animatedButtonStyle,
                  selectedService === "payBills" && styles.selectedService,
                ]}
                onPress={() => handleServicePress("payBills")}
              >
                <View
                  style={[
                    styles.iconBackground,
                    { backgroundColor: "rgba(76, 175, 80, 0.1)" },
                  ]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={32}
                    color="#4CAF50"
                  />
                </View>
                <Text style={styles.serviceText}>Pay Bills</Text>
              </AnimatedTouchable>
            </LinearGradient>
          </Animated.View>
        </View>

        {selectedService && (
          <Animated.View
            entering={FadeInUp.delay(300).duration(500)}
            style={styles.inputContainer}
          >
            <Text style={styles.inputLabel}>
              {selectedService === "buyGoods"
                ? "Till Number"
                : "Paybill Number"}
            </Text>
            <View style={styles.input}>
              <Ionicons
                name="keypad-outline"
                size={24}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.inputField}
                placeholder={`Enter ${
                  selectedService === "buyGoods" ? "till" : "paybill"
                } number`}
                value={inputNumber}
                onChangeText={setInputNumber}
                keyboardType="numeric"
                maxLength={7}
              />
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <LinearGradient
                colors={["#2196F3", "#1976D2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                <Text style={styles.submitButtonText}>Proceed</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        <Animated.View
          entering={FadeInUp.delay(700).duration(500)}
          style={styles.historyButtonContainer}
        >
          <TouchableOpacity style={styles.historyButton}>
            <LinearGradient
              colors={["#2196F3", "#1976D2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.historyGradient}
            >
              <Ionicons name="calendar-outline" size={24} color="#fff" />
              <Text style={styles.historyButtonText}>
                View Transaction History
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoButton: {
    padding: 8,
  },
  loanheaderTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
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
    color: "#fff",
    marginLeft: 16,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  serviceCardContainer: {
    alignItems: "center",
  },
  serviceCard: {
    width: width - 40,
    borderRadius: 12,
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
  serviceGradient: {
    padding: 16,
  },
  serviceButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  iconBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  serviceText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  inputContainer: {
    marginTop: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputIcon: {
    marginRight: 12,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  historyButtonContainer: {
    marginTop: 32,
  },
  historyButton: {
    borderRadius: 8,
    overflow: "hidden",
  },
  historyGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 8,
  },
  selectedService: {
    backgroundColor: "rgba(33, 150, 243, 0.1)",
  },
});
