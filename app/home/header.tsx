import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";

interface HeaderProps {
  userName: string;
  walletBalance: number;
  isBalanceVisible: boolean;
}

export default function Header({
  userName,
  walletBalance,
  isBalanceVisible,
}: HeaderProps) {
  const router = useRouter();
  return (
    <LinearGradient colors={["#1a237e", "#1565c0"]} style={styles.header}>
      <View style={styles.headerTop}>
        <View className="flex flex-row items-center gap-2">
          <Image
            source={require("../../assets/images/innova-icon.png")}
            resizeMode="contain"
            className="w-[40px] h-[40px]"
          />
          <Text style={styles.appName}>Innova</Text>
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            router.push("/notification");
          }}
        >
          <BlurView intensity={80} style={styles.blurView}>
            <Ionicons name="notifications-outline" size={24} color="white" />
          </BlurView>
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>
      <View style={styles.headerBottom}>
        <View style={styles.headerContent}>
          <Text style={styles.headerSubtitle}>Welcome back,</Text>
          <Text style={styles.headerTitle}>{userName}</Text>
        </View>
        <TouchableOpacity style={styles.balanceContainer}>
          <BlurView intensity={30} style={styles.balanceBlur}>
            <Text style={styles.balanceLabel}>Wallet Balance</Text>
            <Text style={styles.balanceAmount}>
              KSh{" "}
              {isBalanceVisible
                ? walletBalance.toFixed(2).toLocaleString()
                : "•••••"}
            </Text>
          </BlurView>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 20,
    paddingBottom: 32,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginTop: 3,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  appName: {
    fontSize: 34,
    fontWeight: "900",
    color: "white",
    letterSpacing: 2,
    fontFamily: "serif",
  },
  iconButton: {
    position: "relative",
  },
  blurView: {
    borderRadius: 10,
    overflow: "hidden",
    padding: 8,
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF3B30",
    borderWidth: 2,
    borderColor: "white",
  },
  headerBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  balanceContainer: {
    overflow: "hidden",
    borderRadius: 15,
  },
  balanceBlur: {
    padding: 15,
    alignItems: "flex-end",
  },
  balanceLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});
