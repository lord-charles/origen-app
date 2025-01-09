import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Text, Image, useColorScheme } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { ThemedText } from "./ThemedText";
import { Colors } from "@/constants/Colors";
import LottieView from "lottie-react-native";

SplashScreen.preventAutoHideAsync();

export default function CustomSplashScreen() {
  const animation = useRef<LottieView>(null);
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  useEffect(() => {
    const prepare = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      SplashScreen.hideAsync();
    };
    prepare();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.logoContainer}>
        <View>
          <Image
            source={require("../assets/images/innova-logo1.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.subtitle, { color: "#005cff" }]}>
          Your Path to Financial Freedom
        </Text>
      </View>

      <View>
        <LottieView
          autoPlay
          ref={animation}
          style={{
            width: 400,
            height: 400,
          }}
          source={require("../assets/lottie/splash-lottie.json")}
        />
      </View>

      <View style={styles.footer} className="items-center">
        <Text style={[styles.footerText, { color: theme.icon }]}>
          powered by
        </Text>
        <ThemedText
          style={[styles.footerText, { color: theme.text }]}
          type="defaultSemiBold"
        >
          Innova Limited
        </ThemedText>
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: theme.icon }]}>
            Version 1.0
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 100,
  },
  logoImage: {
    width: 250,
    height: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 5,
  },
  footer: {
    alignItems: "center",
    marginBottom: 30,
  },
  footerText: {
    fontSize: 14,
    marginBottom: 5,
  },
  versionContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  versionText: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    opacity: 0.7,
    marginRight: 4,
  },
});
