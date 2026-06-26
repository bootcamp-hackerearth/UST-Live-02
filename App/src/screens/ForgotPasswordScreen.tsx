import { useState } from "react";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import GlassCard from "../components/cards/GlassCard";
import AppInput from "../components/inputs/AppInput";
import PrimaryButton from "../components/buttons/PrimaryButton";
import { forgotPassword, resetPassword } from "../services/auth.service";
import {
  isEmail,
  maxLength,
  minLength,
  strongPassword,
} from "../utils/validators";

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleGetQuestion = async () => {
    const nextErrors: any = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!isEmail(email)) {
      nextErrors.email = "Enter a valid email address";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setLoadingQuestion(true);

      const response = await forgotPassword(email.trim());

      if (!response.data.securityQuestion) {
        Alert.alert(
          "Not Available",
          "Password recovery is not set up for this account",
        );

        return;
      }

      setSecurityQuestion(response.data.securityQuestion);
    } catch (error: any) {
      Alert.alert(
        "Failed",
        error?.response?.data?.message || "Unable to fetch security question",
      );
    } finally {
      setLoadingQuestion(false);
    }
  };

  const validateReset = () => {
    const nextErrors: any = {};

    if (!securityAnswer.trim()) {
      nextErrors.securityAnswer = "Security answer is required";
    } else if (!minLength(securityAnswer.trim(), 2)) {
      nextErrors.securityAnswer = "Answer must contain at least 2 characters";
    } else if (!maxLength(securityAnswer.trim(), 100)) {
      nextErrors.securityAnswer = "Answer must not exceed 100 characters";
    }

    if (!newPassword.trim()) {
      nextErrors.newPassword = "New password is required";
    } else if (!maxLength(newPassword, 20)) {
      nextErrors.newPassword = "Password must not exceed 20 characters";
    } else if (!strongPassword(newPassword)) {
      nextErrors.newPassword =
        "Must contain uppercase, lowercase, number and special character";
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = "Confirm password is required";
    } else if (confirmPassword !== newPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateReset()) {
      return;
    }

    try {
      setLoadingReset(true);

      await resetPassword({
        email: email.trim(),
        securityAnswer: securityAnswer.trim(),
        newPassword,
        confirmPassword,
      });

      Alert.alert("Success", "Password reset successfully", [
        {
          text: "OK",
          onPress: () => navigation.replace("Login"),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Failed",
        error?.response?.data?.message || "Unable to reset password",
      );
    } finally {
      setLoadingReset(false);
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

          <Text style={styles.tagline}>Reset Password</Text>

          <Text style={styles.description}>
            Verify your security answer and create a new password.
          </Text>
        </View>

        <GlassCard>
          <Text style={styles.heading}>Find Account</Text>

          <AppInput
            label="Email Address"
            value={email}
            onChangeText={(value) => {
              setEmail(value.trim());
              setSecurityQuestion("");

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

          <PrimaryButton
            title="Get Security Question"
            loading={loadingQuestion}
            onPress={handleGetQuestion}
          />
        </GlassCard>

        {securityQuestion ? (
          <GlassCard>
            <Text style={styles.heading}>Security Verification</Text>

            <View style={styles.questionBox}>
              <Text style={styles.questionLabel}>Security Question</Text>

              <Text style={styles.questionText}>{securityQuestion}</Text>
            </View>

            <AppInput
            label="Security Answer"
            value={securityAnswer}
            maxLength={100}
            onChangeText={(value) => {
                setSecurityAnswer(value);

                if (errors.securityAnswer) {
                  setErrors({
                    ...errors,
                    securityAnswer: "",
                  });
                }
              }}
              error={errors.securityAnswer}
            />

            <AppInput
              label="New Password"
              value={newPassword}
              maxLength={20}
              onChangeText={(value) => {
                setNewPassword(value);

                if (errors.newPassword) {
                  setErrors({
                    ...errors,
                    newPassword: "",
                  });
                }
              }}
              secureTextEntry
              error={errors.newPassword}
            />

            <AppInput
              label="Confirm Password"
              value={confirmPassword}
              maxLength={20}
              onChangeText={(value) => {
                setConfirmPassword(value);

                if (errors.confirmPassword) {
                  setErrors({
                    ...errors,
                    confirmPassword: "",
                  });
                }
              }}
              secureTextEntry
              error={errors.confirmPassword}
            />

            <PrimaryButton
              title="Reset Password"
              loading={loadingReset}
              onPress={handleResetPassword}
            />
          </GlassCard>
        ) : null}

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back to Login</Text>
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
    fontSize: 34,
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
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 18,
  },

  questionBox: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 18,
    padding: 14,
  },

  questionLabel: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },

  questionText: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 21,
  },

  backText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 20,
    textAlign: "center",
  },
});
