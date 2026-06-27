import React, { useState } from "react";
import { router } from "expo-router";
import axios from "axios";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AppInput from "@/components/common/AppInput";
import PrimaryButton from "@/components/common/PrimaryButton";

import {
  changeFirstLoginPassword,
  logout,
} from "@/services/auth.service";

import {
  validateNewPassword,
  validateConfirmPassword,
} from "@/validations/auth.validation";

import { changePasswordStyles as styles } from "@/styles/auth/change-password.style";

export default function ChangePasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const passwordError =
      validateNewPassword(newPassword);

    const confirmationError =
      validateConfirmPassword(
        newPassword,
        confirmPassword
      );

    setNewPasswordError(passwordError);
    setConfirmPasswordError(confirmationError);

    return !passwordError && !confirmationError;
  };

  const handleChangePassword = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await changeFirstLoginPassword({
        newPassword,
        confirmPassword,
      });

      /*
       * Remove the temporary authenticated session.
       * The patient must log in again using the new password.
       */
      await logout();

      Alert.alert(
        "Password Changed",
        "Your password has been changed successfully. Please log in using your new password.",
        [
          {
            text: "Go to Login",
            onPress: () => {
              router.replace("/");
            },
          },
        ]
      );
    } catch (error: unknown) {
      let message =
        "Unable to change password. Please try again.";

      if (axios.isAxiosError(error)) {
        message =
          error.response?.data?.message ||
          error.message ||
          message;

        if (error.response?.status === 401) {
          await logout();

          Alert.alert(
            "Session Expired",
            "Please log in again using your temporary password.",
            [
              {
                text: "Go to Login",
                onPress: () => {
                  router.replace("/");
                },
              },
            ]
          );

          return;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }

      Alert.alert(
        "Password Change Failed",
        message
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
        <View style={styles.card}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>
              HMS
            </Text>
          </View>

          <Text style={styles.title}>
            Create New Password
          </Text>

          <Text style={styles.subtitle}>
            You are using a temporary password.
            Create a new password before continuing.
          </Text>

          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>
              Password must contain:
            </Text>

            <Text style={styles.requirementText}>
              • At least 8 characters
            </Text>

            <Text style={styles.requirementText}>
              • One uppercase letter
            </Text>

            <Text style={styles.requirementText}>
              • One lowercase letter
            </Text>

            <Text style={styles.requirementText}>
              • One number
            </Text>

            <Text style={styles.requirementText}>
              • One special character
            </Text>
          </View>

          <View style={styles.formContainer}>
            <AppInput
              label="New Password"
              placeholder="Enter your new password"
              value={newPassword}
              onChangeText={(value) => {
                setNewPassword(value);

                if (newPasswordError) {
                  setNewPasswordError("");
                }

                if (confirmPasswordError) {
                  setConfirmPasswordError("");
                }
              }}
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
              autoCorrect={false}
              error={newPasswordError}
              rightElement={
                <TouchableOpacity
                  onPress={() => {
                    setShowNewPassword(
                      (currentValue) =>
                        !currentValue
                    );
                  }}
                >
                  <Text
                    style={
                      styles.showPasswordText
                    }
                  >
                    {showNewPassword
                      ? "Hide"
                      : "Show"}
                  </Text>
                </TouchableOpacity>
              }
            />

            <AppInput
              label="Confirm Password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);

                if (confirmPasswordError) {
                  setConfirmPasswordError("");
                }
              }}
              secureTextEntry={
                !showConfirmPassword
              }
              autoCapitalize="none"
              autoCorrect={false}
              error={confirmPasswordError}
              rightElement={
                <TouchableOpacity
                  onPress={() => {
                    setShowConfirmPassword(
                      (currentValue) =>
                        !currentValue
                    );
                  }}
                >
                  <Text
                    style={
                      styles.showPasswordText
                    }
                  >
                    {showConfirmPassword
                      ? "Hide"
                      : "Show"}
                  </Text>
                </TouchableOpacity>
              }
            />

            <PrimaryButton
              title="Change Password"
              onPress={handleChangePassword}
              loading={loading}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}