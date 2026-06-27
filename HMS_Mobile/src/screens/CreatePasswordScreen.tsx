import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { useState } from "react";

import { SafeAreaView } from "react-native-safe-area-context";

import { Picker } from "@react-native-picker/picker";

import { useRoute, useNavigation } from "@react-navigation/native";

import { createPassword } from "../services/auth.service";

import AppInput from "../components/inputs/AppInput";
import GlassCard from "../components/cards/GlassCard";
import PrimaryButton from "../components/buttons/PrimaryButton";

export default function CreatePasswordScreen() {
  const route = useRoute<any>();

  const navigation = useNavigation<any>();

  const loginId = route.params?.loginId;

  const [temporaryPassword, setTemporaryPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [securityQuestion, setSecurityQuestion] = useState("");

  const [securityAnswer, setSecurityAnswer] = useState("");

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<any>({});

  const securityQuestions = [
    "What is your mother's maiden name?",

    "What was the name of your first school?",

    "What is your favorite movie?",

    "What was your childhood nickname?",

    "What is the name of your best friend?",

    "What city were you born in?",

    "What is your favorite food?",

    "What was the name of your first pet?",
  ];

  const validatePassword = (password: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(
      password,
    );
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!temporaryPassword.trim()) {
      newErrors.temporaryPassword = "Temporary password is required";
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (!validatePassword(newPassword)) {
      newErrors.newPassword =
        "Password must contain uppercase, lowercase, number and special character";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!securityQuestion) {
      newErrors.securityQuestion = "Please select a security question";
    }

    if (!securityAnswer.trim()) {
      newErrors.securityAnswer = "Security answer is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const getPasswordStrength = () => {
    let score = 0;

    if (newPassword.length >= 8) score++;

    if (/[A-Z]/.test(newPassword)) score++;

    if (/[a-z]/.test(newPassword)) score++;

    if (/\d/.test(newPassword)) score++;

    if (/[@$!%*?&]/.test(newPassword)) score++;

    if (score <= 2) {
      return {
        text: "Weak Password",
        color: "#EF4444",
        width: "33%",
      };
    }

    if (score <= 4) {
      return {
        text: "Medium Password",
        color: "#F59E0B",
        width: "66%",
      };
    }

    return {
      text: "Strong Password",
      color: "#22C55E",
      width: "100%",
    };
  };
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await createPassword({
        loginId,

        temporaryPassword,

        newPassword,

        confirmPassword,

        securityQuestion,

        securityAnswer,
      });

      Alert.alert("Success", "Password created successfully", [
        {
          text: "OK",

          onPress: () => navigation.replace("Login"),
        },
      ]);
    } catch (error: any) {
      console.log("CREATE PASSWORD ERROR", error?.response?.data);

      Alert.alert(
        "Error",

        error?.response?.data?.message || "Failed to create password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.brand}>Bootstrap HMS</Text>

          <Text style={styles.tagline}>Create Password</Text>

          <Text style={styles.description}>
            Create your permanent password and security settings to continue.
          </Text>
        </View>

        <GlassCard>
          <Text style={styles.title}>First Time Login 🔐</Text>

          <Text style={styles.subtitle}>
            Your temporary password must be changed before continuing.
          </Text>

          <AppInput
            label="Temporary Password"
            value={temporaryPassword}
            onChangeText={(value) => {
              setTemporaryPassword(value);

              if (errors.temporaryPassword) {
                setErrors({
                  ...errors,
                  temporaryPassword: "",
                });
              }
            }}
            secureTextEntry
            error={errors.temporaryPassword}
          />

          <AppInput
            label="New Password"
            value={newPassword}
            onChangeText={(value) => {
              setNewPassword(value);

              if (errors.newPassword) {
                setErrors({
                  ...errors,
                  newPassword: "",
                });
              }
            }}
            secureTextEntry={!showPassword}
            error={errors.newPassword}
          />

          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.showPassword}>
              {showPassword ? "Hide Password" : "Show Password"}
            </Text>
          </TouchableOpacity>

          <View style={styles.strengthBar}>
            <View
              style={[
                styles.strengthFill,
                {
                  width: getPasswordStrength().width as any,
                },
              ]}
            />
          </View>

          <Text
            style={{
              color: getPasswordStrength().color,

              fontWeight: "600",

              marginBottom: 15,
            }}
          >
            {getPasswordStrength().text}
          </Text>

          <Text style={styles.helperText}>
            Password must contain: Uppercase, Lowercase, Number and Special
            Character.
          </Text>

          <AppInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);

              if (errors.confirmPassword) {
                setErrors({
                  ...errors,
                  confirmPassword: "",
                });
              }
            }}
            secureTextEntry={!showConfirmPassword}
            error={errors.confirmPassword}
          />

          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Text style={styles.showPassword}>
              {showConfirmPassword ? "Hide Password" : "Show Password"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Security Question</Text>

          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={securityQuestion}
              onValueChange={(itemValue) => {
                setSecurityQuestion(itemValue);

                if (errors.securityQuestion) {
                  setErrors({
                    ...errors,
                    securityQuestion: "",
                  });
                }
              }}
            >
              <Picker.Item label="Select Security Question" value="" />

              {securityQuestions.map((question) => (
                <Picker.Item key={question} label={question} value={question} />
              ))}
            </Picker>
          </View>

          {errors.securityQuestion ? (
            <Text style={styles.errorText}>{errors.securityQuestion}</Text>
          ) : null}

          <AppInput
            label="Security Answer"
            value={securityAnswer}
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

          <PrimaryButton
            title="Create Password"
            loading={loading}
            onPress={handleSubmit}
          />
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F7FC",
  },

  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },

  hero: {
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

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },

  subtitle: {
    color: "#64748B",
    marginBottom: 24,
    lineHeight: 20,
  },

  showPassword: {
    color: "#2563EB",
    fontWeight: "600",
    textAlign: "right",
    marginTop: -5,
    marginBottom: 12,
  },

  helperText: {
    color: "#64748B",
    fontSize: 12,
    marginBottom: 15,
    lineHeight: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },

  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
  },

  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 4,
  },

  strengthBar: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 10,
  },

  strengthFill: {
    height: "100%",
    borderRadius: 20,
  },
});
