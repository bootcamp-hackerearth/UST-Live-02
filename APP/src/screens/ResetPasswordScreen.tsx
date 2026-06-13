import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { resetPasswordApi } from "../api/auth.api";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { AppNavigation, ROUTES } from "../navigation/routes";
import { getErrorMessage } from "../utils/error";
import { validatePassword } from "../utils/validation";
import { colors, radius, shadow, spacing } from "../theme";

type ResetPasswordScreenProps = {
  navigation: AppNavigation;
  route?: {
    params?: {
      email?: string;
      fromTemporaryPassword?: boolean;
    };
  };
};

export default function ResetPasswordScreen({ navigation, route }: ResetPasswordScreenProps) {
  const initialEmail = route?.params?.email ?? "";
  const isTemporaryPasswordReset = Boolean(route?.params?.fromTemporaryPassword);

  const [email, setEmail] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email.trim() || !newPassword || !confirmPassword) {
      Alert.alert("Missing details", "Please complete all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Password mismatch", "New password and confirm password must match.");
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert(
        "Weak password",
        "Password must be at least 8 characters and include one uppercase letter, one lowercase letter, one number, and one special character.",
      );
      return;
    }

    try {
      setLoading(true);
      await resetPasswordApi({
        email: email.trim().toLowerCase(),
        newPassword,
        confirmPassword,
      });
      Alert.alert("Password updated", "You can now sign in with your new password.", [
        { text: "Sign In", onPress: () => navigation.replace(ROUTES.login) },
      ]);
    } catch (error: unknown) {
      Alert.alert("Reset failed", getErrorMessage(error, "Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          {isTemporaryPasswordReset
            ? "Your temporary password was verified. Create a new password to continue."
            : "Enter your registered email and choose a new secure password."}
        </Text>

        <View style={styles.card}>
          <InputField
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <InputField
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <InputField
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <PrimaryButton title="Update Password" onPress={handleReset} loading={loading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: spacing.lg,
  },
  backText: {
    color: colors.primary,
    fontWeight: "800",
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadow,
  },
});
