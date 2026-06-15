import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { jwtDecode } from "jwt-decode";

import { loginApi } from "../api/auth.api";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { storePatientId, storeToken } from "../utils/storage";
import { AppNavigation, ROUTES } from "../navigation/routes";
import { getErrorMessage } from "../utils/error";
import { colors, radius, shadow, spacing } from "../theme";

type LoginScreenProps = Readonly<{
  navigation: AppNavigation;
}>;

type LoginTokenPayload = {
  patientId?: string;
  patientObjectId?: string;
};

const TITLE_COLOR = "#31476a";
const MUTED_LINK_COLOR = "#5f6f89";
const SECONDARY_TEXT_COLOR = "#6b7280";

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginId.trim() || !password) {
      Alert.alert("Missing details", "Please enter your login ID and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await loginApi({
        loginId: loginId.trim().toLowerCase(),
        password,
      });

      if (res.data?.data?.requiresPasswordReset) {
        navigation.navigate(ROUTES.resetPassword, {
          email: res.data.data.email || loginId.trim().toLowerCase(),
          fromTemporaryPassword: true,
        });
        return;
      }

      const token = res.data?.data?.token;
      if (!token) throw new Error("Token not received from server");

      await storeToken(token);

      const decoded = jwtDecode<LoginTokenPayload>(token);
      if (decoded?.patientObjectId || decoded?.patientId) {
        await storePatientId(decoded.patientObjectId || decoded.patientId || "");
      }

      navigation.reset({
        index: 0,
        routes: [{ name: ROUTES.dashboard }],
      });
    } catch (error: unknown) {
      Alert.alert("Login failed", getErrorMessage(error, "Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.brandRow}>
            <Text style={styles.logoIcon}>H+</Text>
            <Text style={styles.title}>HMS</Text>
          </View>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          <InputField
            label="Email / Login ID"
            value={loginId}
            onChangeText={setLoginId}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="account"
          />

          <InputField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            leftIcon="lock"
            rightIcon={showPassword ? "eye-off" : "eye"}
            onRightIconPress={() => setShowPassword((value) => !value)}
          />

          <PrimaryButton title="Sign In" onPress={handleLogin} loading={loading} />

          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.resetPassword)}>
            <Text style={styles.forgotLink}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.signup)}>
          <Text style={styles.signupText}>
            Don't have an account? <Text style={styles.signupTextStrong}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadow,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  logoIcon: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "900",
    marginRight: spacing.sm,
  },
  title: {
    color: TITLE_COLOR,
    fontSize: 30,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  forgotLink: {
    color: MUTED_LINK_COLOR,
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing.xs,
    textAlign: "center",
  },
  signupText: {
    color: SECONDARY_TEXT_COLOR,
    fontSize: 14,
    marginTop: spacing.lg,
    textAlign: "center",
  },
  signupTextStrong: {
    color: colors.text,
    fontWeight: "900",
  },
});
