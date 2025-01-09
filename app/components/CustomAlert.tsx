import React from "react";
import { StyleSheet, Dimensions, View } from "react-native";
import { Dialog, Portal, Button, Text, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeOut, SlideInUp } from "react-native-reanimated";

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  onDismiss: () => void;
  actions?: Array<{
    label: string;
    onPress: () => void;
    color?: string;
  }>;
}

const { width } = Dimensions.get("window");

export default function PerfectedModernCustomAlert({
  visible,
  title,
  message,
  type = "info",
  onDismiss,
  actions,
}: CustomAlertProps) {
  const getColor = () => {
    switch (type) {
      case "success":
        return "#22C55E"; // A vibrant green
      case "error":
        return "#EF4444"; // A clear red
      case "warning":
        return "#F59E0B"; // A warm amber
      case "info":
      default:
        return "#3B82F6"; // A bright blue
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "check-circle-outline";
      case "error":
        return "alert-circle-outline";
      case "warning":
        return "alert-outline";
      case "info":
      default:
        return "information-outline";
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Animated.View
          entering={SlideInUp.springify().damping(15).stiffness(90)}
          exiting={FadeOut.duration(200)}
        >
          <Surface style={styles.surface} elevation={4}>
            <View style={styles.contentContainer}>
              <Animated.View
                entering={FadeIn.delay(150).duration(300)}
                style={[styles.iconContainer, { backgroundColor: getColor() }]}
              >
                <MaterialCommunityIcons
                  name={getIcon()}
                  size={32}
                  color="white"
                />
              </Animated.View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
            </View>
            <View style={styles.actions}>
              {actions ? (
                actions.map((action, index) => (
                  <Button
                    key={index}
                    onPress={action.onPress}
                    mode="text"
                    textColor={action.color || getColor()}
                    style={styles.actionButton}
                    labelStyle={styles.actionButtonLabel}
                  >
                    {action.label}
                  </Button>
                ))
              ) : (
                <Button
                  onPress={onDismiss}
                  mode="contained"
                  style={[
                    styles.actionButton,
                    styles.singleActionButton,
                    { backgroundColor: getColor() },
                  ]}
                  labelStyle={styles.actionButtonLabel}
                  contentStyle={styles.buttonContent}
                >
                  <Text style={styles.actionButtonLabel}>OK</Text>
                </Button>
              )}
            </View>
          </Surface>
        </Animated.View>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: "transparent",
    elevation: 0,
  },
  surface: {
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    width: width * 0.9,
    maxWidth: 400,
    alignSelf: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  contentContainer: {
    alignItems: "center",
    paddingTop: 36,
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    color: "#1F2937",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  actionButton: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  singleActionButton: {
    minWidth: 120,
  },
  actionButtonLabel: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  buttonContent: {
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
