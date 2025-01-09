import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PUSH_TOKEN_KEY = "pushToken";
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const setupAndroidChannel = async () => {
  if (Platform.OS === "android") {
    try {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        sound: "notification.wav",
        enableVibrate: true,
        enableLights: true,
      });
    } catch (error) {
      console.error("Error setting up Android notification channel:", error);
    }
  }
};

export async function registerForPushNotificationsAsync() {
  let token: string | null;

  try {
    // Check if we already have a token
    token = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    if (token && !token.includes('SIMULATOR-DEV-TOKEN')) return token;

    // Clear any existing simulator tokens in production
    if (token?.includes('SIMULATOR-DEV-TOKEN')) {
      await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
    }

    // Proper device check
    if (!Constants.isDevice) {
      if (__DEV__) {
        console.warn("Running on simulator - using development token");
        const deviceId = await AsyncStorage.getItem("deviceId") || Date.now().toString();
        await AsyncStorage.setItem("deviceId", deviceId);
        const devToken = `SIMULATOR-DEV-TOKEN-${deviceId}`;
        await AsyncStorage.setItem(PUSH_TOKEN_KEY, devToken);
        return devToken;
      } else {
        throw new Error('Push notifications are only supported on physical devices in production');
      }
    }

    await setupAndroidChannel();

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      throw new Error("Permission not granted for push notifications");
    }

    try {
      // For local development builds, we don't need projectId
      token = (await Notifications.getExpoPushTokenAsync()).data;

      if (!token) {
        throw new Error('Failed to get push token');
      }

      console.log('Generated push token:', token);
      
      // Save token for future use
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    } catch (error) {
      console.error("Error getting push token:", error);
      throw error;
    }

    return token;
  } catch (error) {
    console.error("Error getting push token:", error);
    throw error;
  }
}

export async function addNotificationListener(
  callback: (notification: Notifications.Notification) => void
) {
  try {
    return Notifications.addNotificationReceivedListener(callback);
  } catch (error) {
    console.error("Error adding notification listener:", error);
    throw error;
  }
}

export async function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  try {
    return Notifications.addNotificationResponseReceivedListener(callback);
  } catch (error) {
    console.error("Error adding notification response listener:", error);
    throw error;
  }
}

export async function getBadgeCount(): Promise<number> {
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    console.error("Error getting badge count:", error);
    return 0;
  }
}

export async function setBadgeCount(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error("Error setting badge count:", error);
  }
}

export async function dismissAllNotifications(): Promise<void> {
  try {
    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    console.error("Error dismissing notifications:", error);
  }
}
