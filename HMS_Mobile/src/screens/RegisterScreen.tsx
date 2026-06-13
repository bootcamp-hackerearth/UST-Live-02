import { useState } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import { registerPatient } from "../services/patient.service";
import {
  isEmail,
  isPhone,
  onlyLetters,
  strongPassword,
} from "../utils/validators";
import AppInput from "../components/inputs/AppInput";
import PrimaryButton from "../components/buttons/PrimaryButton";
import GlassCard from "../components/cards/GlassCard";

export default function Register() {
  const navigation = useNavigation<any>();

  const [firstName, setFirstName] = useState("");

  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");

  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (!onlyLetters(firstName)) {
      newErrors.firstName = "Only letters allowed";
    } else if (firstName.length < 2) {
      newErrors.firstName = "Minimum 2 characters required";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (!onlyLetters(lastName)) {
      newErrors.lastName = "Only letters allowed";
    } else if (lastName.length < 2) {
      newErrors.lastName = "Minimum 2 characters required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isEmail(email)) {
      newErrors.email = "Enter valid email address";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!isPhone(phone)) {
      newErrors.phone = "Enter valid 10 digit mobile number";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (!strongPassword(password)) {
      newErrors.password =
        "Must contain uppercase, lowercase, number & special character";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
        firstName,
        lastName,
        email,
        phone,
        password,
      });

      Alert.alert("Success", "Account created successfully", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Login"),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Registration Failed", error?.message || "Please try again");
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
