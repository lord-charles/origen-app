import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

interface AlertAction {
  text: string;
  onPress: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  actions?: AlertAction[];
  onClose?: () => void;
  iconColor?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  actions = [{ text: "OK", onPress: () => {}, style: "default" }],
  onClose,
  iconColor = "#FF3B30",
  iconName = "alert-circle",
}) => {
  const handleAction = (action: AlertAction) => {
    action.onPress();
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <BlurView intensity={30} style={styles.overlay}>
        <View style={styles.alertContainer}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: `${iconColor}20` }]}>
              <Ionicons name={iconName} size={32} color={iconColor} />
            </View>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  { backgroundColor: iconColor },
                  index > 0 && styles.buttonMarginLeft,
                  action.style === "cancel" && styles.cancelButton,
                  action.style === "destructive" && styles.destructiveButton,
                ]}
                onPress={() => handleAction(action)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.buttonText,
                    action.style === "cancel" && styles.cancelButtonText,
                    action.style === "destructive" && styles.destructiveButtonText,
                  ]}
                >
                  {action.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  alertContainer: {
    width: width * 0.85,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconContainer: {
    marginBottom: 15,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  button: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonMarginLeft: {
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: "#E5E5EA",
  },
  destructiveButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  cancelButtonText: {
    color: "#000000",
  },
  destructiveButtonText: {
    color: "white",
  },
});

export default CustomAlert;
