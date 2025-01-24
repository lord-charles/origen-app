import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Text, TextInput } from "react-native-paper";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";

export default function ContactFormScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const [formData, setFormData] = useState({
    companyName: "",
    fullName: "",
    email: "",
    mobileNumber: "",
  });

  const handleInputChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="auto" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { backgroundColor: theme.background },
            { flexGrow: 1 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={true}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: theme.primary }]}
              onPress={() => router.back()}
              className="mt-1 rounded-full p-2"
            >
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Title Section - Updated styling */}
          <Animated.View
            entering={FadeInDown.delay(200)}
            style={styles.titleContainer}
          >
            <Text
              style={[styles.mainTitle, { color: theme.primary }]}
              variant="headlineMedium"
            >
              Have us reach out!
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.text }]}
              variant="titleMedium"
            >
              Fill out the form, our team will be in touch!
            </Text>
          </Animated.View>

          {/* Illustration */}
          <View style={styles.illustrationContainer} className="">
            <Image
              source={require("../../assets/images/Calls-cuate.png")}
              style={styles.illustration}
            />
          </View>

          {/* Form Section - Updated spacing */}
          <View
            className="gap-4 absolute bottom-[100px] left-6 right-6"
            style={{ backgroundColor: theme.background }}
          >
            <Animated.View entering={FadeInDown.delay(300)}>
              <TextInput
                mode="outlined"
                label="Company Name"
                value={formData.companyName}
                onChangeText={(value) =>
                  handleInputChange("companyName", value)
                }
                style={[styles.input, { backgroundColor: theme.background }]}
                contentStyle={styles.inputContent}
                outlineColor={theme.secondary}
                activeOutlineColor={theme.primary}
                textColor={theme.text}
                right={
                  formData.companyName.length > 0 ? (
                    <TextInput.Icon
                      icon="close"
                      onPress={() => handleInputChange("companyName", "")}
                      color={theme.secondary}
                    />
                  ) : null
                }
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400)}>
              <TextInput
                mode="outlined"
                label="Full Name"
                value={formData.fullName}
                onChangeText={(value) => handleInputChange("fullName", value)}
                style={[styles.input, { backgroundColor: theme.background }]}
                contentStyle={styles.inputContent}
                outlineColor={theme.secondary}
                activeOutlineColor={theme.primary}
                textColor={theme.text}
                right={
                  formData.fullName.length > 0 ? (
                    <TextInput.Icon
                      icon="close"
                      onPress={() => handleInputChange("fullName", "")}
                      color={theme.secondary}
                    />
                  ) : null
                }
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(500)}>
              <TextInput
                mode="outlined"
                label="Email"
                value={formData.email}
                onChangeText={(value) => handleInputChange("email", value)}
                style={[styles.input, { backgroundColor: theme.background }]}
                contentStyle={styles.inputContent}
                keyboardType="email-address"
                outlineColor={theme.secondary}
                activeOutlineColor={theme.primary}
                textColor={theme.text}
                right={
                  formData.email.length > 0 ? (
                    <TextInput.Icon
                      icon="close"
                      onPress={() => handleInputChange("email", "")}
                      color={theme.secondary}
                    />
                  ) : null
                }
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(600)}>
              <TextInput
                mode="outlined"
                label="Mobile Number"
                value={formData.mobileNumber}
                onChangeText={(value) =>
                  handleInputChange("mobileNumber", value)
                }
                style={[styles.input, { backgroundColor: theme.background }]}
                contentStyle={styles.inputContent}
                keyboardType="phone-pad"
                outlineColor={theme.secondary}
                activeOutlineColor={theme.primary}
                textColor={theme.text}
                right={
                  formData.mobileNumber.length > 0 ? (
                    <TextInput.Icon
                      icon="close"
                      onPress={() => handleInputChange("mobileNumber", "")}
                      color={theme.secondary}
                    />
                  ) : null
                }
              />
            </Animated.View>
          </View>

          {/* Footer Section - Updated button */}
          <Animated.View
            entering={FadeInDown.delay(1200)}
            style={styles.footerContainer}
            className="absolute bottom-[10px] left-6 right-4"
          >
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: theme.primary }]}
            >
              <View style={styles.gradientButton}>
                <Text style={styles.buttonText} variant="titleMedium">
                  Submit Request
                </Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  titleContainer: {
    marginBottom: 40,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 12,
  },
  subtitle: {
    opacity: 0.8,
  },
  form: {
    flex: 1,
    gap: 10,
  },
  illustrationContainer: {
    alignItems: "center",
    width: 300,
    height: 300,
  },
  illustration: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
  input: {
    fontSize: 16,
    elevation: 0,
    borderRadius: 12,
  },
  inputContent: {
    paddingVertical: 12,
  },
  footerContainer: {
    paddingVertical: 20,
    width: "100%",
  },
  nextButton: {
    width: "100%",
    borderRadius: 16,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    marginRight: 12,
    fontWeight: "600",
  },
});
