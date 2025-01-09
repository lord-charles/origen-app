import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Slider } from "@miblanchard/react-native-slider";
import advancesService, { AdvanceConfig } from "@/services/advances.service";

interface AdvanceApplicationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    purpose: string;
    repaymentPeriod: number;
    comments: string;
  }) => Promise<void>;
  maxAmount: number;
}

interface CustomToastProps {
  message: string;
  type: "success" | "error";
  visible: boolean;
}

const CustomToast = ({ message, type, visible }: CustomToastProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        type === "success" ? styles.successToast : styles.errorToast,
        { opacity: fadeAnim },
      ]}
    >
      <Ionicons
        name={type === "success" ? "checkmark-circle" : "alert-circle"}
        size={24}
        color="#fff"
      />
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

export default function AdvanceApplicationModal({
  isVisible,
  onClose,
  onSubmit,
  maxAmount,
}: AdvanceApplicationModalProps) {
  const [amount, setAmount] = useState(1000);
  const [purpose, setPurpose] = useState("");
  const [purposeError, setPurposeError] = useState("");
  const [repaymentPeriod, setRepaymentPeriod] = useState(3);
  const [comments, setComments] = useState("");
  const [advanceConfig, setAdvanceConfig] = useState<AdvanceConfig | null>(
    null
  );
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    visible: boolean;
  }>({
    message: "",
    type: "success",
    visible: false,
  });

  useEffect(() => {
    fetchAdvanceConfig();
  }, []);

  const fetchAdvanceConfig = async () => {
    try {
      const config = await advancesService.getAdvanceConfig();
      setAdvanceConfig(config);

      setRepaymentPeriod(config.data.advanceMaxRepaymentPeriod);
    } catch (error) {
      console.error("Error fetching advance config:", error);
    }
  };

  const interestRate = advanceConfig
    ? advanceConfig.data.advanceDefaultInterestRate
    : 1;

  useEffect(() => {
    if (advanceConfig) {
      setRepaymentPeriod(advanceConfig.data.advanceMaxRepaymentPeriod);
    }
  }, [advanceConfig]);

  const totalInterest = Number(amount) * (interestRate / 100) * repaymentPeriod;
  const totalRepayment = Number(amount) + totalInterest;
  const monthlyRepayment = totalRepayment / repaymentPeriod;

  const getRepaymentPeriods = () => {
    if (!advanceConfig) return [1, 2, 3];
    const periods = [];
    for (let i = 1; i <= advanceConfig.data.advanceMaxRepaymentPeriod; i++) {
      periods.push(i);
    }
    return periods;
  };

  const resetForm = () => {
    setAmount(1000); // Set to minimum amount instead of 0
    setPurpose("");
    setRepaymentPeriod(
      advanceConfig ? advanceConfig.data.advanceMaxRepaymentPeriod : 3
    );
    setComments("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const validatePurpose = (text: string) => {
    if (text.length > 50) {
      setPurposeError("Purpose must be 50 characters or less");
      return false;
    }
    setPurposeError("");
    return true;
  };

  const handlePurposeChange = (text: string) => {
    if (text.length <= 50) {
      setPurpose(text);
      validatePurpose(text);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!amount) {
        showToast("Please enter an amount", "error");
        return;
      }

      if (!purpose.trim()) {
        showToast("Please enter a purpose", "error");
        return;
      }

      if (!validatePurpose(purpose)) {
        showToast(purposeError, "error");
        return;
      }

      setIsLoading(true);
      await onSubmit({
        amount,
        purpose: purpose.trim(),
        repaymentPeriod,
        comments: comments.trim(),
      });

      showToast("Advance request submitted successfully", "success");
      handleClose();
    } catch (error: any) {
      showToast(error?.message || "Failed to submit advance request", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      resetForm();
    }
  }, [isVisible]);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <TouchableOpacity style={styles.overlay} onPress={handleClose} />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Request Advance</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.amountSection}>
              <Text style={styles.label}>Amount (KSh)</Text>
              <View style={styles.sliderContainer}>
                <Slider
                  value={Number(amount)}
                  onValueChange={(value) =>
                    setAmount(Math.round(Number(value) / 100) * 100)
                  }
                  minimumValue={
                    advanceConfig ? advanceConfig.data.advanceMinAmount : 1000
                  }
                  maximumValue={
                    advanceConfig
                      ? Math.min(advanceConfig.data.advanceMaxAmount, maxAmount)
                      : maxAmount
                  }
                  step={100}
                  trackStyle={styles.track}
                  thumbStyle={styles.thumb}
                  minimumTrackTintColor="#1a237e"
                  maximumTrackTintColor="#ddd"
                />
                <Text style={styles.amountText}>
                  KSh {Number(amount).toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Purpose</Text>
              <TextInput
                style={[styles.input, purposeError && styles.inputError]}
                value={purpose}
                onChangeText={handlePurposeChange}
                placeholder="e.g., Medical expenses"
                maxLength={30}
                returnKeyType="next"
                placeholderTextColor={purposeError ? "#ff0000" : "#666"}
              />
              {purposeError ? (
                <Text style={styles.errorText}>{purposeError}</Text>
              ) : null}
            </View>

            <View style={styles.repaymentSection}>
              <Text style={styles.label}>Repayment Period (Months)</Text>
              <View style={styles.periodButtons}>
                {getRepaymentPeriods().map((period) => (
                  <View
                    key={period}
                    style={[
                      styles.periodButton,
                      period ===
                        advanceConfig?.data.advanceMaxRepaymentPeriod &&
                        styles.periodButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.periodButtonText,
                        period ===
                          advanceConfig?.data.advanceMaxRepaymentPeriod &&
                          styles.periodButtonTextActive,
                      ]}
                    >
                      {period}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Comments (Optional)</Text>
              <TextInput
                style={styles.input}
                value={comments}
                onChangeText={(text) => setComments(text.substring(0, 20))}
                placeholder="Brief comment"
                maxLength={20}
                returnKeyType="done"
                placeholderTextColor={purposeError ? "#ff0000" : "#666"}
              />
            </View>

            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Interest Rate:</Text>
                <Text style={styles.summaryValue}>{interestRate}%</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Interest:</Text>
                <Text style={styles.summaryValue}>
                  KSh {totalInterest.toLocaleString()}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Repayment:</Text>
                <Text style={styles.summaryValue}>
                  KSh {totalRepayment.toLocaleString()}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Monthly Installment:</Text>
                <Text style={styles.summaryValue}>
                  KSh {monthlyRepayment.toLocaleString()}
                </Text>
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.submitButton,
              isLoading && styles.submitButtonDisabled,
            ]}
            onPress={() => handleSubmit()}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Request</Text>
            )}
          </TouchableOpacity>
        </View>
        <CustomToast {...toast} />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1a237e",
  },
  closeButton: {
    padding: 8,
  },
  form: {
    flex: 1,
  },
  amountSection: {
    marginBottom: 20,
  },
  sliderContainer: {
    width: "100%",
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  track: {
    height: 4,
    borderRadius: 2,
  },
  thumb: {
    width: 20,
    height: 20,
    backgroundColor: "#1a237e",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  amountText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1a237e",
    textAlign: "center",
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  repaymentSection: {
    marginBottom: 20,
  },
  periodButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  periodButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  periodButtonActive: {
    backgroundColor: "#1a237e",
    borderColor: "#1a237e",
  },
  periodButtonText: {
    fontSize: 16,
    color: "#666",
  },
  periodButtonTextActive: {
    color: "#fff",
  },
  summarySection: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#1a237e",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    flexGrow: 1,
  },
  toast: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "#000",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successToast: {
    backgroundColor: "#22c55e",
  },
  errorToast: {
    backgroundColor: "#ef4444",
  },
  toastText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
});
