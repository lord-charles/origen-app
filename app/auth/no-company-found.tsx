import React from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Text } from "react-native-paper";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="auto" />

      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: theme.background },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
          <Image
            source={require("../../assets/images/innova-logo1.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Rest of the component structure stays the same, just updating styles */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require("../../assets/images/Sign-up-cuate.png")}
            style={styles.illustration}
          />
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View className="items-center">
            <Text
              style={{ color: theme.secondary, fontFamily: "SpaceMono" }}
              variant="titleMedium"
            >
              Your company isn’t registered,
            </Text>
            <Text
              style={{ color: theme.secondary, fontFamily: "SpaceMono" }}
              variant="titleSmall"
            >
              but we’d love to have you onboard!
            </Text>
          </View>
          <View style={styles.bulletPoints}>
            <Animated.View
              entering={FadeInDown.delay(400)}
              style={styles.bulletItem}
            >
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={theme.primary}
              />
              <Text
                style={{ color: theme.text, marginLeft: 10 }}
                variant="titleMedium"
              >
                Access your salary anytime
              </Text>
            </Animated.View>
            <Animated.View
              entering={FadeInDown.delay(600)}
              style={styles.bulletItem}
            >
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={theme.primary}
              />
              <Text
                style={{ color: theme.text, marginLeft: 10 }}
                variant="titleMedium"
              >
                Easy onboarding
              </Text>
            </Animated.View>
            <Animated.View
              entering={FadeInDown.delay(800)}
              style={styles.bulletItem}
            >
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={theme.primary}
              />
              <Text
                style={{ color: theme.text, marginLeft: 10 }}
                variant="titleMedium"
              >
                No interest charged
              </Text>
            </Animated.View>
          </View>
        </View>

        <View className="flex flex-row items-center justify-between w-full gap-x-0">
          {/* Back Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.secondary }]}
            className="flex-row items-center gap-x-2 justify-center"
            onPress={() => {
              router.back();
            }}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color="white"
              className="mt-1"
            />
            <Text
              style={{ fontFamily: "RobotoBold", color: "white" }}
              variant="titleMedium"
            >
              Back
            </Text>
          </TouchableOpacity>
          {/* Register Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            className="flex-row items-center gap-x-2 justify-center"
            onPress={() => {
              router.push("/auth/register");
            }}
          >
            <Text
              style={{ fontFamily: "RobotoBold", color: "white" }}
              variant="titleMedium"
            >
              Register Company
            </Text>
            <Ionicons
              name="business"
              size={24}
              color="white"
              className="mt-1"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 50,
    gap: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 220,
    height: 70,
    resizeMode: "contain",
  },
  illustrationContainer: {
    alignItems: "center",
    width: 300,
    height: 300,
  },
  illustration: {
    width: 250,
    height: 250,
    resizeMode: "contain",
  },
  mainContent: {
    alignItems: "center",
    width: "100%",
    gap: 20,
  },
  bulletPoints: {
    width: "100%",
    gap: 15,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  nextButton: {
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: "49%",
  },
});
