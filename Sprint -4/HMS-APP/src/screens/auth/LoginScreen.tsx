import React, { useState } from "react";
import { router } from "expo-router";

import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";

import { login } from "@/services/auth.service";

import AppInput from "@/components/common/AppInput";
import PrimaryButton from "@/components/common/PrimaryButton";

import { loginStyles as styles } from "@/styles/auth/login.style";

import {
  validateLoginEmail,
  validateLoginPassword,
  validateEmailFormat,
} from "@/validations/auth.validation";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const emailValidationError =
      validateLoginEmail(email);

    const passwordValidationError =
      validateLoginPassword(password);

    let finalEmailError = emailValidationError;

    if (
      !finalEmailError &&
      !validateEmailFormat(email)
    ) {
      finalEmailError =
        "Please enter a valid email address";
    }

    setEmailError(finalEmailError);
    setPasswordError(passwordValidationError);

    return (
      !finalEmailError &&
      !passwordValidationError
    );
  };

  const handleLogin = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const user = await login(
        email.trim().toLowerCase(),
        password
      );

      console.log("Logged in user:", user);
      console.log(
        "Must change password:",
        user.mustChangePassword
      );

      /*
       * Admin-created patients receive a temporary password.
       * They must change it before accessing the home page.
       */
      if (user.mustChangePassword === true) {
        router.replace("/change-password");
        return;
      }

      Alert.alert(
        "Login Success",
        `Welcome ${user.firstName}!`,
        [
          {
            text: "Continue",
            onPress: () => {
              router.replace("/(tabs)/home");
            },
          },
        ]
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to log in. Please try again.";

      Alert.alert(
        "Login Failed",
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.scrollContainer
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.loginCard}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>
              HMS
            </Text>
          </View>

          <Text style={styles.title}>
            Patient Login
          </Text>

          <Text style={styles.subtitle}>
            Login to view your profile and manage
            appointments
          </Text>

          <View style={styles.formContainer}>
            <AppInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={(value) => {
                setEmail(value);

                if (emailError) {
                  setEmailError("");
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={emailError}
            />

            <AppInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(value) => {
                setPassword(value);

                if (passwordError) {
                  setPasswordError("");
                }
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              error={passwordError}
              rightElement={
                <TouchableOpacity
                  onPress={() =>
                    setShowPassword(
                      (currentValue) =>
                        !currentValue
                    )
                  }
                >
                  <Text
                    style={
                      styles.showPasswordText
                    }
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </Text>
                </TouchableOpacity>
              }
            />

            <PrimaryButton
              title="Login"
              onPress={handleLogin}
              loading={loading}
            />
          </View>

          <View
            style={styles.registerContainer}
          >
            <Text
              style={styles.registerText}
            >
              New patient?
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.push("/register")
              }
            >
              <Text
                style={styles.registerLink}
              >
                {" "}
                Register here
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}