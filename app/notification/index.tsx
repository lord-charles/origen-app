import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Platform,
  Switch,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  Layout,
} from "react-native-reanimated";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
// import { usePushNotifications } from "@/hooks/usePushNotifications";
// import * as Notifications from "expo-notifications";
// import AsyncStorage from "@react-native-async-storage/async-storage";

type NotificationType = "loan" | "general" | "promo";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: Date;
  isRead: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const mockNotifications: Notification[] = [
  // {
  //   id: "1",
  //   type: "loan",
  //   title: "Loan Approved",
  //   message: "Your loan application for KSh 50,000 has been approved.",
  //   date: new Date("2024-03-15T10:00:00"),
  //   isRead: false,
  // },
  // {
  //   id: "2",
  //   type: "general",
  //   title: "Repayment Reminder",
  //   message: "Your next loan repayment of KSh 5,000 is due in 3 days.",
  //   date: new Date("2024-03-14T14:30:00"),
  //   isRead: true,
  // },
  // {
  //   id: "3",
  //   type: "promo",
  //   title: "New Loan Offer",
  //   message:
  //     "You're eligible for a low-interest loan up to KSh 100,000. Apply now!",
  //   date: new Date("2024-03-13T09:15:00"),
  //   isRead: false,
  // },
];

export default function NotificationScreen() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [refreshing, setRefreshing] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  // const { registerToken, dismissAllNotifications, setBadgeCount } = usePushNotifications();

  // Check push notification permission status on mount
  // useEffect(() => {
  //   checkPushNotificationStatus();
  // }, []);

  // const checkPushNotificationStatus = async () => {
  //   try {
  //     const { status } = await Notifications.getPermissionsAsync();
  //     setPushEnabled(status === 'granted');
  //   } catch (error) {
  //     console.error('Error checking notification status:', error);
  //   }
  // };

  // const handleTogglePushNotifications = async () => {
  //   try {
  //     if (!pushEnabled) {
  //       // Request permission
  //       const { status } = await Notifications.requestPermissionsAsync();
  //       if (status === 'granted') {
  //         // await registerToken();
  //         setPushEnabled(true);
  //         Alert.alert(
  //           'Success',
  //           'Push notifications have been enabled successfully!'
  //         );
  //       } else {
  //         Alert.alert(
  //           'Permission Required',
  //           'Please enable push notifications in your device settings to receive updates.'
  //         );
  //       }
  //     } else {
  //       // Disable notifications
  //       await AsyncStorage.removeItem('pushToken');
  //       // await dismissAllNotifications();
  //       // await setBadgeCount(0);
  //       setPushEnabled(false);
  //       Alert.alert(
  //         'Notifications Disabled',
  //         'You will no longer receive push notifications.'
  //       );
  //     }
  //   } catch (error) {
  //     console.error('Error toggling notifications:', error);
  //     Alert.alert('Error', 'Failed to update notification settings.');
  //   }
  // };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh notification list logic here
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Reset badge count when user views notifications
      // await setBadgeCount(0);
    } catch (error) {
      console.error("Error refreshing notifications:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: Notification[] } = {};
    notifications.forEach((notif) => {
      const dateKey = notif.date.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(notif);
    });
    return Object.entries(groups).map(([date, items]) => ({ date, items }));
  }, [notifications]);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const renderNotification = useCallback(
    ({ item }: { item: Notification }) => (
      <NotificationItem
        key={item.id}
        item={item}
        onDelete={deleteNotification}
        onMarkAsRead={markAsRead}
      />
    ),
    [deleteNotification, markAsRead]
  );

  const renderGroup = useCallback(
    ({ item }: { item: { date: string; items: Notification[] } }) => (
      <View key={item.date}>
        <Text style={styles.sectionHeader}>{item.date}</Text>
        <FlatList
          data={item.items}
          renderItem={renderNotification}
          keyExtractor={(notification) => notification.id}
          scrollEnabled={false}
        />
      </View>
    ),
    [renderNotification]
  );

  if (notifications.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient colors={["#1a237e", "#0d47a1"]} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={["#0ea5e9", "#0284c7"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <View style={styles.settingsContainer}>
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Push Notifications</Text>
          <Switch
            value={pushEnabled}
            // onValueChange={handleTogglePushNotifications}
            trackColor={{ false: "#767577", true: "#0ea5e9" }}
            thumbColor={pushEnabled ? "#fff" : "#f4f3f4"}
          />
        </View>
      </View>

      <FlatList
        data={groupedNotifications}
        renderItem={renderGroup}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1a237e"
            colors={["#1a237e"]}
          />
        }
      />
    </GestureHandlerRootView>
  );
}

const NotificationItem = React.memo(
  ({
    item,
    onDelete,
    onMarkAsRead,
  }: {
    item: Notification;
    onDelete: (id: string) => void;
    onMarkAsRead: (id: string) => void;
  }) => {
    const translateX = useSharedValue(0);
    const itemHeight = useSharedValue(80); // Adjust based on your item height

    const panGesture = useCallback((event: PanGestureHandlerGestureEvent) => {
      "worklet";
      translateX.value = event.nativeEvent.translationX;
    }, []);

    const panEnd = useCallback(() => {
      "worklet";
      if (translateX.value < -100) {
        translateX.value = withTiming(-100, {}, () => {
          runOnJS(onDelete)(item.id);
        });
      } else if (translateX.value > 100) {
        translateX.value = withTiming(100, {}, () => {
          runOnJS(onMarkAsRead)(item.id);
        });
      } else {
        translateX.value = withSpring(0);
      }
    }, [item.id, onDelete, onMarkAsRead]);

    const rStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
    }));

    const rContainerStyle = useAnimatedStyle(() => ({
      height: itemHeight.value,
      opacity: itemHeight.value === 0 ? 0 : 1,
      marginBottom: itemHeight.value === 0 ? 0 : 10,
    }));

    const getNotificationTypeStyle = (type: NotificationType) => {
      switch (type) {
        case "loan":
          return styles.loanTypeBadge;
        case "general":
          return styles.generalTypeBadge;
        case "promo":
          return styles.promoTypeBadge;
        default:
          return {};
      }
    };

    return (
      <Animated.View
        style={[styles.notificationContainer, rContainerStyle]}
        // layout={Layout.springify()}
      >
        <Animated.View style={[styles.deleteAction, { right: 0 }]}>
          <Ionicons name="trash-outline" size={24} color="#fff" />
        </Animated.View>
        <Animated.View style={[styles.readAction, { left: 0 }]}>
          <Ionicons name="checkmark-outline" size={24} color="#fff" />
        </Animated.View>
        <PanGestureHandler onGestureEvent={panGesture} onEnded={panEnd}>
          <AnimatedTouchable
            style={[styles.notification, rStyle]}
            onPress={() => console.log("Notification pressed", item.id)}
          >
            <Animated.View
              style={[
                styles.notificationContent,
                { opacity: item.isRead ? 0.6 : 1 },
              ]}
            >
              <View style={styles.notificationHeader}>
                <View
                  style={[
                    styles.notificationTypeBadge,
                    getNotificationTypeStyle(item.type),
                  ]}
                >
                  <Text style={styles.notificationTypeText}>
                    {item.type.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.notificationTime}>
                  {item.date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationMessage} numberOfLines={2}>
                {item.message}
              </Text>
            </Animated.View>
          </AnimatedTouchable>
        </PanGestureHandler>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 40 : 0,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 40 : 0,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  settingsButton: {
    padding: 8,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginTop: 24,
    marginBottom: 8,
  },
  notificationContainer: {
    marginBottom: 10,
  },
  notification: {
    backgroundColor: "#fff",
    borderRadius: 12,
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
  notificationContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  notificationTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  notificationTypeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  loanTypeBadge: {
    backgroundColor: "#4CAF50",
  },
  generalTypeBadge: {
    backgroundColor: "#2196F3",
  },
  promoTypeBadge: {
    backgroundColor: "#FFC107",
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#666",
  },
  deleteAction: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF5252",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  readAction: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6B7280",
  },
  settingsContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  settingText: {
    fontSize: 16,
    color: "#1f2937",
  },
});
