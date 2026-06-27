import { useState } from "react";

import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useNavigation } from "@react-navigation/native";

import { login } from "../services/auth.service";

import { saveToken, saveRefreshToken } from "../storage/token.storage";
import { isEmail } from "../utils/validators";
import AppInput from "../components/inputs/AppInput";
import PrimaryButton from "../components/buttons/PrimaryButton";
import GlassCard from "../components/cards/GlassCard";

export default function Login() {
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isEmail(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await login(email, password);

      const loginResponse = response.data.data;

      const accessToken = response.data.data.accessToken;

      const refreshToken = response.data.data.refreshToken;

      await saveToken(accessToken);

      await saveRefreshToken(refreshToken);

      if (loginResponse.user?.isFirstLogin) {
        navigation.replace("CreatePassword", {
          loginId: email,
        });

        return;
      }

      navigation.replace("PatientTabs");
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error?.response?.data?.message || "Unknown Error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Text style={styles.brand}>Bootstrap HMS</Text>

          <Text style={styles.tagline}>Smart Healthcare. Simplified.</Text>

          <Text style={styles.description}>
            Access appointments, prescriptions and healthcare services anytime,
            anywhere.
          </Text>
        </View>

        <GlassCard>
          <Text style={styles.heading}>Welcome Back 👋</Text>

          <Text style={styles.subHeading}>
            Sign in to continue your healthcare journey.
          </Text>

          <AppInput
            label="Email Address"
            value={email}
            onChangeText={(value) => {
              setEmail(value);

              if (errors.email) {
                setErrors({
                  ...errors,
                  email: "",
                });
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <AppInput
            label="Password"
            value={password}
            onChangeText={(value) => {
              setPassword(value);

              if (errors.password) {
                setErrors({
                  ...errors,
                  password: "",
                });
              }
            }}
            secureTextEntry
            error={errors.password}
          />

          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          <PrimaryButton
            title="Login"
            loading={loading}
            onPress={handleLogin}
          />
        </GlassCard>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.registerText}>
            New to Bootstrap HMS?
            <Text style={styles.registerLink}> Create Account</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FC",
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },

  heroSection: {
    marginBottom: 30,
  },

  brand: {
    fontSize: 36,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },

  tagline: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2563EB",
    textAlign: "center",
    marginTop: 8,
  },

  description: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 12,
    lineHeight: 22,
    paddingHorizontal: 10,
  },

  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },

  subHeading: {
    color: "#64748B",
    marginBottom: 24,
    lineHeight: 20,
  },

  forgotPassword: {
    color: "#2563EB",
    fontWeight: "600",
    textAlign: "right",
    marginTop: -2,
    marginBottom: 12,
  },

  registerText: {
    textAlign: "center",
    marginTop: 24,
    color: "#64748B",
    fontSize: 14,
  },

  registerLink: {
    color: "#2563EB",
    fontWeight: "700",
  },
});
