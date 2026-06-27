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

type FormErrors = Record<string, string>;

const removeEmptyErrors = (errors: FormErrors) =>
  Object.fromEntries(
    Object.entries(errors).filter(([, message]) => Boolean(message)),
  );

const getNameError = (value: string, label: string) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return `${label} is required`;
  }

  if (!onlyLetters(value)) {
    return "Only letters allowed";
  }

  if (trimmedValue.length < 2) {
    return "Minimum 2 characters required";
  }

  if (!maxLength(trimmedValue, 50)) {
    return "Maximum 50 characters allowed";
  }

  return "";
};

const getEmailError = (value: string) => {
  if (!value.trim()) {
    return "Email is required";
  }

  return isEmail(value) ? "" : "Enter valid email address";
};

const getPhoneError = (value: string) => {
  if (!value.trim()) {
    return "Phone number is required";
  }

  return isPhone(value) ? "" : "Enter valid 10 digit mobile number";
};

const getPasswordError = (value: string) => {
  if (!value.trim()) {
    return "Password is required";
  }

  if (value.length > 20) {
    return "Password must not exceed 20 characters";
  }

  return strongPassword(value)
    ? ""
    : "Must contain uppercase, lowercase, number & special character";
};

const getConfirmPasswordError = (password: string, confirmPassword: string) => {
  if (!confirmPassword.trim()) {
    return "Confirm password is required";
  }

  return password === confirmPassword ? "" : "Passwords do not match";
};

const getSecurityQuestionError = (value: string) =>
  value ? "" : "Please select a security question";

const getSecurityAnswerError = (value: string) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "Security answer is required";
  }

  if (trimmedValue.length < 2) {
    return "Security answer must contain at least 2 characters";
  }

  return trimmedValue.length > 100
    ? "Security answer must not exceed 100 characters"
    : "";
};

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
    const newErrors = removeEmptyErrors({
      firstName: getNameError(firstName, "First name"),
      lastName: getNameError(lastName, "Last name"),
      email: getEmailError(email),
      phone: getPhoneError(phone),
      password: getPasswordError(password),
      confirmPassword: getConfirmPasswordError(password, confirmPassword),
      securityQuestion: getSecurityQuestionError(securityQuestion),
      securityAnswer: getSecurityAnswerError(securityAnswer),
    });

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
