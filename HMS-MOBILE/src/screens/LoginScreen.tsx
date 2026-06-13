import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { TextInput, Button } from "react-native-paper";
import { loginApi } from "../api/auth.api";
import { storeToken } from "../utils/storage";

type Errors = {
  loginId?: string;
  password?: string;
};

export default function LoginScreen({ navigation }: any) {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [apiError, setApiError] = useState<string>("");

  const validate = (): boolean => {
    const newErrors: Errors = {};

    if (!loginId.trim()) {
      newErrors.loginId = "Email or Login ID is required";
    } else if (
      loginId.includes("@") &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginId)
    ) {
      newErrors.loginId = "Enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    setApiError("");
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await loginApi({ loginId, password });
      const token = res.data?.token || res.data?.data?.token;

      if (!token) throw new Error("Token not received from server");

      await storeToken(token);

      navigation.reset({ index: 0, routes: [{ name: "Dashboard" }] });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Login failed";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>🏥 HMS</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {/* Login ID */}
          <TextInput
            label="Email / Login ID"
            value={loginId}
            onChangeText={(v) => {
              setLoginId(v);
              if (errors.loginId) setErrors((e) => ({ ...e, loginId: undefined }));
            }}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            error={!!errors.loginId}
            left={<TextInput.Icon icon="account" />}
          />
          {errors.loginId ? (
            <Text style={styles.errorText}>⚠ {errors.loginId}</Text>
          ) : null}

          {/* Password */}
          <TextInput
            label="Password"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
            }}
            secureTextEntry={!showPassword}
            mode="outlined"
            style={styles.input}
            error={!!errors.password}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword((s) => !s)}
              />
            }
          />
          {errors.password ? (
            <Text style={styles.errorText}>⚠ {errors.password}</Text>
          ) : null}

          {apiError ? (
            <View style={styles.apiErrorBox}>
              <Text style={styles.apiErrorText}>⚠ {apiError}</Text>
            </View>
          ) : null}

          <Button
            mode="contained"
            loading={loading}
            onPress={handleLogin}
            style={styles.button}
            contentStyle={{ paddingVertical: 6 }}
          >
            Sign In
          </Button>

          <TouchableOpacity onPress={() => navigation.navigate("ResetPassword")}>
            <Text style={styles.forgotLink}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.signupLink}>
            Don't have an account?{" "}
            <Text style={{ fontWeight: "bold" }}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f0f4ff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1e3a8a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 24,
  },
  input: {
    marginBottom: 4,
    backgroundColor: "#fff",
  },
  errorText: {
    fontSize: 12,
    color: "#dc2626",
    marginBottom: 10,
    marginLeft: 4,
  },
  apiErrorBox: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    padding: 10,
    marginBottom: 4,
  },
  apiErrorText: {
    fontSize: 13,
    color: "#dc2626",
    textAlign: "center",
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: "#2563eb",
  },
  forgotLink: {
    marginTop: 14,
    textAlign: "center",
    color: "#2563eb",
    fontSize: 13,
  },
  signupLink: {
    textAlign: "center",
    color: "#374151",
    fontSize: 14,
  },
});