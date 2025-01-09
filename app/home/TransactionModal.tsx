import React, { useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Transaction } from "@/services/transactions.service";

interface TransactionModalProps {
  isVisible: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  userId: string;
}

const { height } = Dimensions.get("window");

const TransactionModal: React.FC<TransactionModalProps> = ({
  isVisible,
  onClose,
  transaction,
  userId,
}) => {
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  if (!transaction) return null;

  const getIconName = (type: string) => {
    switch (type) {
      case "paybill":
        return "receipt-outline";
      case "b2c":
        return "arrow-down-outline";
      default:
        return "cash-outline";
    }
  };

  const getIconColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "failed":
        return "#EF4444";
      case "success":
      case "completed":
        return "#22C55E";
      default:
        return "#F59E0B";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });
  };

  const formatAmount = (amount: number, transactionType: string) => {
    const sign =
      transactionType === "b2c"
        ? "+"
        : transaction.transactionType === "transfer_to_wallet" &&
          userId === transaction.phoneNumber
        ? "+"
        : transaction?.accountReference?.includes("mpesa-to-wallet")
        ? "+"
        : "-";
    return `${sign} KES ${amount.toFixed(2)}`;
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <Animated.View
          style={[
            styles.modalView,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.contentContainer}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: getIconColor(transaction.status) + "20" },
              ]}
            >
              <Ionicons
                name={getIconName(transaction.transactionType)}
                size={40}
                color={getIconColor(transaction.status)}
              />
            </View>
            <Text style={styles.title}>
              {transaction.transactionType.toUpperCase()} Transaction
            </Text>
            <View style={styles.amountContainer}>
              <Text
                style={[
                  styles.amount,
                  { color: getIconColor(transaction.status) },
                ]}
              >
                {formatAmount(transaction.amount, transaction.transactionType)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Status</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getIconColor(transaction.status) + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getIconColor(transaction.status) },
                  ]}
                >
                  {transaction.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.separator} />
            <View style={styles.detailRow}>
              <Text style={styles.label}>Transaction ID:</Text>
              <Text
                style={styles.value}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {transaction.accountReference}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>
                {transaction.transactionType === "transfer_to_wallet"
                  ? "Recepient WalletId"
                  : "Phone Number"}
              </Text>
              <Text style={styles.value}>{transaction.phoneNumber}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>My WalletId</Text>
              <Text style={styles.value}>{userId}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{formatDate(transaction.date)}</Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: "90%",
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 10,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#1F2937",
  },
  amountContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  amount: {
    fontSize: 36,
    fontWeight: "bold",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#6B7280",
  },
  value: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
    marginLeft: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 15,
  },
});

export default TransactionModal;
