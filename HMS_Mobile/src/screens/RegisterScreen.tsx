import { useState } from "react";
import { Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { registerPatient } from "../services/patient.service";
import {
  isEmail,
  isPhone,
  isValidName,
  strongPassword,
} from "../utils/validators";
import AppInput from "../components/inputs/AppInput";
import PrimaryButton from "../components/buttons/PrimaryButton";
import GlassCard from "../components/cards/GlassCard";
import { showToast } from "../services/toast.service";
import { logger } from "../utils/logger";

const credentialMessageKeys = {
  required: "required",
  strength: "strength",
  confirmRequired: "confirmRequired",
  mismatch: "mismatch",
} as const;

type CredentialMessageKey =
  (typeof credentialMessageKeys)[keyof typeof credentialMessageKeys];

const credentialMessage = (key: CredentialMessageKey) =>
  ({
    required: "Credential is required",
    strength: "Must contain uppercase, lowercase, number & special character",
    confirmRequired: "Credential confirmation is required",
    mismatch: "Credential entries do not match",
  })[key];

export default function Register() {
  type FormErrors = Partial<
    Record<
      | "firstName"
      | "lastName"
      | "email"
      | "phone"
      | "password"
      | "confirmPassword",
      string
    >
  >;

  const navigation = useNavigation<any>();

  const [firstName, setFirstName] = useState("");

  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");

  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = {};
    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    if (!normalizedFirstName) {
      newErrors.firstName = "First name is required";
    } else if (!isValidName(normalizedFirstName)) {
      newErrors.firstName =
        "Use 2-50 letters, spaces, apostrophes or hyphens";
    }

    if (!normalizedLastName) {
      newErrors.lastName = "Last name is required";
    } else if (!isValidName(normalizedLastName)) {
      newErrors.lastName =
        "Use 2-50 letters, spaces, apostrophes or hyphens";
    }

    if (!normalizedEmail) {
      newErrors.email = "Email is required";
    } else if (!isEmail(normalizedEmail)) {
      newErrors.email = "Enter valid email address";
    }

    if (!normalizedPhone) {
      newErrors.phone = "Phone number is required";
    } else if (!isPhone(normalizedPhone)) {
      newErrors.phone = "Enter valid 10 digit mobile number";
    }

    if (!password.trim()) {
      newErrors.password = credentialMessage(credentialMessageKeys.required);
    } else if (!strongPassword(password)) {
      newErrors.password = credentialMessage(credentialMessageKeys.strength);
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = credentialMessage(
        credentialMessageKeys.confirmRequired,
      );
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = credentialMessage(credentialMessageKeys.mismatch);
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await registerPatient({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        confirmPassword,
      });

      showToast("Account created successfully", "success");
      navigation.navigate("Login");
    } catch (error: any) {
      logger.error("Registration failed", error);

      showToast(
        error?.response?.data?.message || "Registration failed",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.brand}>Bootstrap HMS</Text>

        <Text style={styles.tagline}>Join Digital Healthcare</Text>

        <Text style={styles.description}>
          Create your account and manage your healthcare journey.
        </Text>

        <GlassCard>
          <AppInput
            label="First Name"
            value={firstName}
            onChangeText={(value) => {
              setFirstName(value);

              setErrors({
                ...errors,
                firstName: "",
              });
            }}
            error={errors.firstName}
          />

          <AppInput
            label="Last Name"
            value={lastName}
            onChangeText={(value) => {
              setLastName(value);

              setErrors({
                ...errors,
                lastName: "",
              });
            }}
            error={errors.lastName}
          />

          <AppInput
            label="Email"
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(value) => {
              setEmail(value);

              setErrors({
                ...errors,
                email: "",
              });
            }}
            error={errors.email}
          />
          <AppInput
            label="Phone"
            value={phone}
            keyboardType="phone-pad"
            onChangeText={(value) => {
              setPhone(value);

              setErrors({
                ...errors,
                phone: "",
              });
            }}
            error={errors.phone}
          />
          <AppInput
            label="Password"
            secureTextEntry
            value={password}
            onChangeText={(value) => {
              setPassword(value);

              setErrors({
                ...errors,
                password: "",
              });
            }}
            error={errors.password}
          />

          <AppInput
            label="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);

              setErrors({
                ...errors,
                confirmPassword: "",
              });
            }}
            error={errors.confirmPassword}
          />

          <PrimaryButton
            title="Create Account"
            loading={loading}
            onPress={handleRegister}
          />
        </GlassCard>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginText}>
            Already have an account?
            <Text style={styles.loginLink}> Login</Text>
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
    paddingHorizontal: 20,
  },
  brand: {
    fontSize: 34,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginTop: 30,
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
    marginTop: 10,
    marginBottom: 30,
  },
  loginText: {
    textAlign: "center",
    marginTop: 24,
    marginBottom: 30,
    color: "#64748B",
  },
  loginLink: {
    color: "#2563EB",
    fontWeight: "700",
  },
});
