import { useState } from "react";
import {
  Text,
  View,
  Alert,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";

import { useNavigation } from "@react-navigation/native";

import { registerPatient } from "../services/patient.service";
import {
  isEmail,
  isPhone,
  maxLength,
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

  const [securityQuestion, setSecurityQuestion] = useState("");

  const [securityAnswer, setSecurityAnswer] = useState("");

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<any>({});

  const securityQuestions = [
    "What is your mother's maiden name?",
    "What was the name of your first school?",
    "What is your favorite movie?",
    "What was your childhood nickname?",
    "What city were you born in?",
    "What is your favorite food?",
  ];

  const validateForm = () => {
    const newErrors: any = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (!onlyLetters(firstName)) {
      newErrors.firstName = "Only letters allowed";
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = "Minimum 2 characters required";
    } else if (!maxLength(firstName.trim(), 50)) {
      newErrors.firstName = "Maximum 50 characters allowed";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (!onlyLetters(lastName)) {
      newErrors.lastName = "Only letters allowed";
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = "Minimum 2 characters required";
    } else if (!maxLength(lastName.trim(), 50)) {
      newErrors.lastName = "Maximum 50 characters allowed";
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
    } else if (password.length > 20) {
      newErrors.password = "Password must not exceed 20 characters";
    } else if (!strongPassword(password)) {
      newErrors.password =
        "Must contain uppercase, lowercase, number & special character";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!securityQuestion) {
      newErrors.securityQuestion = "Please select a security question";
    }

    if (!securityAnswer.trim()) {
      newErrors.securityAnswer = "Security answer is required";
    } else if (securityAnswer.trim().length < 2) {
      newErrors.securityAnswer =
        "Security answer must contain at least 2 characters";
    } else if (securityAnswer.trim().length > 100) {
      newErrors.securityAnswer = "Security answer must not exceed 100 characters";
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
        email: email.trim(),
        phone,
        password,
        confirmPassword,
        securityQuestion,
        securityAnswer: securityAnswer.trim(),
      });

      Alert.alert("Success", "Account created successfully", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Login"),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Registration Failed",
        error?.response?.data?.message || "Unable to create account",
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
            maxLength={50}
            onChangeText={(value) => {
              setFirstName(value.replace(/[^A-Za-z ]/g, ""));

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
            maxLength={50}
            onChangeText={(value) => {
              setLastName(value.replace(/[^A-Za-z ]/g, ""));

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
              setEmail(value.trim());

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
            maxLength={10}
            keyboardType="phone-pad"
            onChangeText={(value) => {
              setPhone(value.replace(/\D/g, "").slice(0, 10));

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
            maxLength={20}
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
            maxLength={20}
            onChangeText={(value) => {
              setConfirmPassword(value);

              setErrors({
                ...errors,
                confirmPassword: "",
              });
            }}
            error={errors.confirmPassword}
          />

          <Text style={styles.inputLabel}>Security Question</Text>

          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={securityQuestion}
              onValueChange={(value) => {
                setSecurityQuestion(value);

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

  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },

  pickerWrapper: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
  },

  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 4,
  },
});
