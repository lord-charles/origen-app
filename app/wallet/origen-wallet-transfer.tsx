// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   Keyboard,
//   ActivityIndicator,
// } from "react-native";
// import { StatusBar } from "expo-status-bar";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { router } from "expo-router";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { ObjectId } from "bson";
// import * as Clipboard from "expo-clipboard";
// import * as Haptics from "expo-haptics";
// import walletService from "@/services/wallet.service";
// import PerfectedModernCustomAlert from "@/app/components/CustomAlert";
// import CustomAlert from "../../components/CustomAlert";

// export default function WagelyftTransferScreen() {
//   const [walletAddress, setWalletAddress] = useState("");
//   const [amount, setAmount] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [errors, setErrors] = useState<{ wallet?: string; amount?: string }>(
//     {}
//   );
//   const [showRecents, setShowRecents] = useState(false);
//   const [isFocused, setIsFocused] = useState({ wallet: false, amount: false });
//   const [clipboardStatus, setClipboardStatus] = useState<"idle" | "pasted">(
//     "idle"
//   );
//   const [alertConfig, setAlertConfig] = useState<{
//     visible: boolean;
//     title: string;
//     message: string;
//     type: "success" | "error" | "info" | "warning";
//     actions?: Array<{
//       label: string;
//       onPress: () => void;
//       color?: string;
//     }>;
//   }>({
//     visible: false,
//     title: "",
//     message: "",
//     type: "info",
//   });

//   const [buttonText, setButtonText] = useState("Send Money");

//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState("");
//   const [alertMessage, setAlertMessage] = useState("");
//   const [clipboardContent, setClipboardContent] = useState("");

//   const hideAlert = () => {
//     setAlertConfig((prev) => ({ ...prev, visible: false }));
//   };

//   useEffect(() => {
//     const checkClipboard = async () => {
//       try {
//         const hasClipboardString = await Clipboard.hasStringAsync();
//         if (!hasClipboardString) {
//           await Haptics.notificationAsync(
//             Haptics.NotificationFeedbackType.Warning
//           );
//           setAlertTitle("No Wallet Address Found");
//           setAlertMessage(
//             "To quickly fill in the recipient wallet address, copy it to your clipboard first."
//           );
//           setAlertVisible(true);
//           return;
//         }

//         const clipboardContent = await Clipboard.getStringAsync();
//         if (clipboardContent && ObjectId.isValid(clipboardContent)) {
//           await Haptics.notificationAsync(
//             Haptics.NotificationFeedbackType.Success
//           );
//           setAlertTitle("Wallet Address Detected");
//           setAlertMessage(
//             "Would you like to paste the recipient wallet address from your clipboard?"
//           );
//           setClipboardContent(clipboardContent);
//           setAlertVisible(true);
//         } else {
//           await Haptics.notificationAsync(
//             Haptics.NotificationFeedbackType.Warning
//           );
//           setAlertTitle("Invalid Address Format");
//           setAlertMessage(
//             "The content in your clipboard is not a valid wallet address. Please copy a valid recipient address and try again."
//           );
//           setAlertVisible(true);
//         }
//       } catch (error) {
//         console.error("Failed to check clipboard:", error);
//         setAlertTitle("Clipboard Error");
//         setAlertMessage(
//           "Unable to access clipboard. Please ensure you have granted the necessary permissions."
//         );
//         setAlertVisible(true);
//       }
//     };

//     checkClipboard();
//   }, []);

//   const handleWalletFocus = () => {
//     setIsFocused({ ...isFocused, wallet: true });
//   };

//   const handleWalletBlur = () => {
//     setIsFocused({ ...isFocused, wallet: false });
//   };

//   const handleAmountFocus = () => {
//     setIsFocused({ ...isFocused, amount: true });
//   };

//   const handleAmountBlur = () => {
//     setIsFocused({ ...isFocused, amount: false });
//   };

//   const validateForm = (): boolean => {
//     const newErrors: { wallet?: string; amount?: string } = {};

//     if (!walletAddress) {
//       newErrors.wallet = "Wallet address is required";
//     } else if (!ObjectId.isValid(walletAddress)) {
//       newErrors.wallet = "Invalid wallet address format";
//     }

//     if (!amount) {
//       newErrors.amount = "Amount is required";
//     } else if (parseFloat(amount) <= 0) {
//       newErrors.amount = "Amount must be greater than 0";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleNext = async () => {
//     Keyboard.dismiss();
//     if (!validateForm()) return;

//     setButtonText("Processing...");
//     setIsLoading(true);
//     try {
//       const response = await walletService.transferToWallet({
//         recipientWalletId: walletAddress,
//         amount: parseFloat(amount),
//         description: "Wallet Transfer",
//       });

//       await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//       setAlertConfig({
//         visible: true,
//         type: "success",
//         title: "Transfer Successful",
//         message: `Successfully sent ${walletService.formatBalance(
//           response.data.amount
//         )} to ${response.data.recipientName}.\n\nTransaction ID: ${
//           response.data.transactionId
//         }\nYour Balance: ${walletService.formatBalance(
//           response.data.senderBalance
//         )}`,
//         actions: [
//           {
//             label: "View Receipt",
//             onPress: () => {
//               hideAlert();
//               router.push(`/home`);
//             },
//             color: "#22C55E",
//           },
//           {
//             label: "Done",
//             onPress: () => {
//               hideAlert();
//               router.back();
//             },
//           },
//         ],
//       });
//     } catch (error: any) {
//       await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
//       setAlertConfig({
//         visible: true,
//         type: "error",
//         title: "Transfer Failed",
//         message:
//           error.message || "Failed to process transfer. Please try again.",
//         actions: [
//           {
//             label: "Try Again",
//             onPress: hideAlert,
//             color: "#EF4444",
//           },
//         ],
//       });
//     } finally {
//       setIsLoading(false);
//       setButtonText("Send Money");
//     }
//   };

//   const pasteFromClipboard = async () => {
//     try {
//       const hasClipboardString = await Clipboard.hasStringAsync();
//       if (!hasClipboardString) {
//         await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
//         setAlertTitle("Empty Clipboard");
//         setAlertMessage("No content available to paste.");
//         setAlertVisible(true);
//         return;
//       }

//       const clipboardContent = await Clipboard.getStringAsync();
//       if (clipboardContent && ObjectId.isValid(clipboardContent)) {
//         await Haptics.notificationAsync(
//           Haptics.NotificationFeedbackType.Success
//         );
//         setWalletAddress(clipboardContent);
//         setClipboardStatus("pasted");
//         setTimeout(() => setClipboardStatus("idle"), 2000);
//       } else {
//         await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
//         setAlertTitle("Invalid Wallet Address");
//         setAlertMessage("The clipboard content is not a valid wallet address.");
//         setAlertVisible(true);
//       }
//     } catch (error) {
//       console.error("Failed to paste from clipboard:", error);
//       setAlertTitle("Error");
//       setAlertMessage("Failed to paste from clipboard. Please try again.");
//       setAlertVisible(true);
//     }
//   };

//   const getGradientStyle = (isLoading: boolean) => ({
//     ...styles.gradient,
//     opacity: isLoading ? 0.8 : 1,
//   });

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor="#1a237e" translucent={true} style="light" />

//       <LinearGradient colors={["#1a237e", "#0d47a1"]} style={styles.header}>
//         <TouchableOpacity
//           onPress={() => router.back()}
//           style={styles.backButton}
//           accessibilityLabel="Go back"
//         >
//           <Ionicons name="arrow-back" size={24} color="white" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Innova Wallet</Text>
//         <TouchableOpacity
//           onPress={() => {
//             setAlertTitle("Information");
//             setAlertMessage(
//               "This screen allows you to transfer funds to another Innova wallet."
//             );
//             setAlertVisible(true);
//           }}
//           style={styles.infoButton}
//           accessibilityLabel="More information"
//         >
//           <Ionicons name="information-circle-outline" size={24} color="white" />
//         </TouchableOpacity>
//       </LinearGradient>

//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         style={[{ flex: 1 }, styles.keyboardView]}
//       >
//         <ScrollView
//           style={{ backgroundColor: "#f8f9fa" }}
//           contentContainerStyle={styles.content}
//           keyboardShouldPersistTaps="handled"
//         >
//           <Text style={styles.title}>Enter Transfer Details</Text>

//           <View style={styles.formContainer}>
//             <View style={styles.inputGroup}>
//               <Text style={styles.label}>Recipient Wallet Address</Text>
//               <View
//                 style={[
//                   styles.inputContainer,
//                   isFocused.wallet && styles.inputFocused,
//                   errors.wallet && styles.inputError,
//                 ]}
//               >
//                 <Ionicons
//                   name="wallet-outline"
//                   size={20}
//                   color={isFocused.wallet ? "#2196F3" : "#666"}
//                   style={styles.inputIcon}
//                 />
//                 <TextInput
//                   style={[styles.input, { backgroundColor: "#fff" }]}
//                   value={walletAddress}
//                   onChangeText={setWalletAddress}
//                   placeholder="Enter wallet address"
//                   onFocus={handleWalletFocus}
//                   onBlur={handleWalletBlur}
//                   autoCapitalize="none"
//                   placeholderTextColor="#666"
//                 />
//                 <TouchableOpacity
//                   onPress={pasteFromClipboard}
//                   style={styles.pasteButton}
//                 >
//                   <View>
//                     <Ionicons
//                       name={
//                         clipboardStatus === "pasted"
//                           ? "checkmark-circle-outline"
//                           : "clipboard-outline"
//                       }
//                       size={20}
//                       color={
//                         clipboardStatus === "pasted" ? "#27AE60" : "#2196F3"
//                       }
//                     />
//                   </View>
//                 </TouchableOpacity>
//               </View>
//               {errors.wallet && (
//                 <Text style={styles.errorText}>{errors.wallet}</Text>
//               )}
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.label}>Amount</Text>
//               <View
//                 style={[
//                   styles.inputContainer,
//                   isFocused.amount && styles.inputFocused,
//                   errors.amount && styles.inputError,
//                 ]}
//               >
//                 <Text style={styles.currency}>KSh</Text>
//                 <TextInput
//                   style={[styles.input, { backgroundColor: "#fff" }]}
//                   value={amount}
//                   onChangeText={setAmount}
//                   placeholder="0.00"
//                   keyboardType="decimal-pad"
//                   maxLength={10}
//                   onFocus={handleAmountFocus}
//                   onBlur={handleAmountBlur}
//                   placeholderTextColor="#666"
//                 />
//               </View>
//               {errors.amount && (
//                 <Text style={styles.errorText}>{errors.amount}</Text>
//               )}
//             </View>
//           </View>
//         </ScrollView>

//         <View style={styles.footer}>
//           <TouchableOpacity onPress={handleNext} disabled={isLoading}>
//             <View style={styles.button}>
//               <LinearGradient
//                 colors={["#2196F3", "#1976D2"]}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 0 }}
//                 style={getGradientStyle(isLoading)}
//               >
//                 {isLoading ? (
//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <>
//                     <Ionicons
//                       name="paper-plane"
//                       size={20}
//                       color="#fff"
//                       style={{ marginRight: 8 }}
//                     />
//                     <Text style={styles.buttonText}>{buttonText}</Text>
//                   </>
//                 )}
//               </LinearGradient>
//             </View>
//           </TouchableOpacity>
//         </View>

//         <PerfectedModernCustomAlert
//           visible={alertConfig.visible}
//           title={alertConfig.title}
//           message={alertConfig.message}
//           type={alertConfig.type}
//           onDismiss={hideAlert}
//           actions={alertConfig.actions}
//         />
//         <CustomAlert
//           visible={alertVisible}
//           title={alertTitle}
//           message={alertMessage}
//           actions={
//             alertTitle === "Wallet Address Detected"
//               ? [
//                   {
//                     text: "No",
//                     style: "cancel",
//                     onPress: () => setAlertVisible(false),
//                   },
//                   {
//                     text: "Yes",
//                     style: "default",
//                     onPress: () => {
//                       setWalletAddress(clipboardContent);
//                       setClipboardStatus("pasted");
//                       setTimeout(() => setClipboardStatus("idle"), 2000);
//                       setAlertVisible(false);
//                     },
//                   },
//                 ]
//               : [{ text: "OK", onPress: () => setAlertVisible(false) }]
//           }
//           onClose={() => setAlertVisible(false)}
//         />
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f8f9fa",
//   },
//   keyboardView: {
//     flex: 1,
//     backgroundColor: "#f8f9fa",
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   backButton: {
//     padding: 8,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "600",
//     color: "#fff",
//   },
//   infoButton: {
//     padding: 8,
//   },
//   content: {
//     padding: 20,
//     flexGrow: 1,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 24,
//     textShadowColor: "rgba(0, 0, 0, 0.1)",
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 2,
//   },
//   formContainer: {
//     gap: 24,
//   },
//   inputGroup: {
//     gap: 8,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#333",
//   },
//   inputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     height: 56,
//     borderWidth: 1,
//     borderColor: "#e0e0e0",
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.05,
//     shadowRadius: 3.84,
//     elevation: 2,
//   },
//   inputFocused: {
//     borderColor: "#2196F3",
//   },
//   inputError: {
//     borderColor: "#ff5252",
//   },
//   inputIcon: {
//     marginRight: 12,
//   },
//   currency: {
//     fontSize: 16,
//     color: "#333",
//     marginRight: 8,
//   },
//   input: {
//     flex: 1,
//     fontSize: 16,
//     color: "#333",
//     backgroundColor: "#fff",
//     height: 48,
//   },
//   pasteButton: {
//     padding: 8,
//     borderRadius: 20,
//     backgroundColor: "rgba(33, 150, 243, 0.1)",
//   },
//   errorText: {
//     fontSize: 12,
//     color: "#ff5252",
//     marginTop: 4,
//   },
//   footer: {
//     padding: 20,
//     paddingBottom: Platform.OS === "ios" ? 34 : 20,
//   },
//   button: {
//     borderRadius: 12,
//     overflow: "hidden",
//   },
//   gradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 16,
//     paddingHorizontal: 32,
//   },
//   buttonText: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#fff",
//     letterSpacing: 0.5,
//   },
// });
export default function WagelyftTransferScreen() {}
