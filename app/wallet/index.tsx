"use client";

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authService from "@/services/auth.service";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import CustomAlert from "../../components/CustomAlert";

export default function Wallet() {
  const [isAddressVisible, setIsAddressVisible] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [userName, setUserName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const router = useRouter();

  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(walletAddress);
      // Trigger haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setCopyStatus("copied");
      setIsAddressVisible(true);

      // Reset copy status after animation
      setTimeout(() => {
        setIsAddressVisible(false);
        setCopyStatus("idle");
      }, 2500);
    } catch (error) {
      console.error("Failed to copy address:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user_data");
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.firstName || "User");
        setWalletAddress(user._id);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchBalance = async () => {
        try {
          const balance = await authService.getWalletBalance();
          setWalletBalance(balance);
        } catch (error) {
          console.error("Error fetching wallet balance:", error);
        }
      };

      fetchBalance();
    }, [])
  );

  useEffect(() => {
    loadUserData();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#2E1D6D", "#1A1035"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Innova Wallet</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => {
              setAlertTitle("Information");
              setAlertMessage(
                "Welcome to your Innova Wallet! Here you can view your balance, transaction history, and access various wallet services like deposits, withdrawals, and transfers."
              );
              setAlertVisible(true);
            }}
          >
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        <Animated.View entering={FadeIn.delay(300)} style={styles.balanceCard}>
          <LinearGradient
            colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
            style={styles.glassCard}
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.welcomeText}>Welcome back</Text>
                <Text style={styles.nameText}>{userName}</Text>
              </View>
              <View style={styles.balanceBadge}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceAmount}>KSh {walletBalance}</Text>
              </View>
            </View>

            <View style={styles.addressContainer}>
              <Text style={styles.addressLabel}>Wallet Address</Text>
              <TouchableOpacity
                onPress={copyToClipboard}
                style={[
                  styles.addressButton,
                  copyStatus === "copied" && styles.addressButtonCopied,
                ]}
                activeOpacity={0.7}
                className="flex-row items-center justify-between"
              >
                <Text style={styles.addressText}>{walletAddress}</Text>
                <Ionicons
                  name={
                    copyStatus === "copied"
                      ? "checkmark-outline"
                      : "copy-outline"
                  }
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
              {isAddressVisible && (
                <Animated.Text
                  entering={FadeIn.duration(200)}
                  style={styles.copiedText}
                >
                  Address copied to clipboard!
                </Animated.Text>
              )}
            </View>
          </LinearGradient>
        </Animated.View>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push("/wallet/wallet-history")}
        >
          <Ionicons name="calendar-outline" size={24} color="#fff" />
          <Text style={styles.historyText}>Wallet Transaction History</Text>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={styles.actionsContainer}>
          <Text style={styles.nameText} className="ml-3 p-2">
            Quick Actions
          </Text>
          <Text style={styles.sectionTitle}>Send Cash</Text>
          <View style={styles.actionGrid}>
            {[
              {
                icon: "send",
                label: "Wallet To Wallet",
                color: "#FF6B6B",
                navigateTo: "/wallet/origen-wallet-transfer",
              },
              {
                icon: "phone-portrait",
                label: "Wallet To Mpesa",
                color: "#4ECDC4",
                navigateTo: "/mpesa/send-to-mpesa",
              },
            ].map((action, index) => (
              <Animated.View
                key={index}
                entering={SlideInDown.delay(index * 100)}
                style={styles.actionWrapper}
              >
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: action.color },
                  ]}
                  onPress={() => router.push(action.navigateTo as any)}
                >
                  <View style={styles.iconWrapper}>
                    <Ionicons
                      name={action.icon as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color="#fff"
                    />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
          <Text style={styles.sectionTitle}>Add Cash</Text>

          <View style={styles.actionGrid}>
            {[
              {
                icon: "cash",
                label: "Mpesa To Wallet ",
                color: "#45B7D1",
                navigateTo: "/mpesa/deposit-from-mpesa",
              },
              {
                icon: "trending-up",
                label: "Advance To Wallet",
                color: "#96C93D",
                navigateTo: "/wallet/deposit-from-advance",
              },
            ].map((action, index) => (
              <Animated.View
                key={index}
                entering={SlideInDown.delay(index * 100)}
                style={styles.actionWrapper}
              >
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: action.color },
                  ]}
                  onPress={() => router.push(action.navigateTo as any)}
                >
                  <View style={styles.iconWrapper}>
                    <Ionicons
                      name={action.icon as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color="#fff"
                    />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* <View style={styles.recentContainer} className="rounded-lg">
          <Text style={styles.sectionTitle} className="pb-2">
            Recent Activity
          </Text>
          {[1, 2, 3].map((_, index) => (
            <BlurView
              key={index}
              intensity={0}
              style={[styles.recentItem, index === 2 && styles.lastItem]}
            >
              <View
                style={[styles.activityDot, index === 0 && styles.activeDot]}
              />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Salary Deposit</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
              <Text style={styles.activityAmount}>+KSh 50,000</Text>
            </BlurView>
          ))}
          <View className="h-10" />
        </View> */}
      </ScrollView>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1035",
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceCard: {
    marginHorizontal: 20,
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 20,
  },
  glassCard: {
    padding: 18,
    borderRadius: 25,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 5,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  balanceBadge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 15,
  },
  balanceLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  addressContainer: {
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 15,
    borderRadius: 15,
  },
  addressLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 10,
  },
  addressButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  addressButtonCopied: {
    backgroundColor: "rgba(39, 174, 96, 0.2)",
  },
  addressText: {
    color: "#fff",
    marginRight: 8,
    fontSize: 16,
    fontFamily: "SpaceGrotesk_400Regular",
  },
  copiedText: {
    color: "#27AE60",
    marginTop: 8,
    fontSize: 14,
    fontFamily: "SpaceGrotesk_400Regular",
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  historyText: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
  actionsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 20,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
  },
  actionWrapper: {
    width: "50%",
    padding: 10,
  },
  actionButton: {
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  actionLabel: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  recentContainer: {
    marginBottom: 30,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 15,
    borderRadius: 15,
  },
  lastItem: {
    marginBottom: 0,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginRight: 15,
  },
  activeDot: {
    backgroundColor: "#4ECDC4",
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 5,
  },
  activityTime: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
  },
  activityAmount: {
    color: "#4ECDC4",
    fontSize: 16,
    fontWeight: "600",
  },
});
