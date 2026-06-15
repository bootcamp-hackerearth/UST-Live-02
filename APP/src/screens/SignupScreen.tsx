import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { signupApi } from "../api/auth.api";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import { AppNavigation, ROUTES } from "../navigation/routes";
import { getErrorMessage } from "../utils/error";
import {
  DATE_REGEX,
  LETTERS_ONLY_REGEX,
  PHONE_REGEX,
  isFutureDate,
  onlyLetters,
  onlyNumbers,
} from "../utils/validation";
import { colors, spacing } from "../theme";

type SignupScreenProps = Readonly<{
  navigation: AppNavigation;
}>;

const TITLE_COLOR = "#2f4f83";
const SECTION_TEXT_COLOR = "#6b7280";
const VALID_GENDERS = new Set(["MALE", "FEMALE", "OTHER"]);

export default function SignupScreen({ navigation }: SignupScreenProps) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "MALE",
    dateOfBirth: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const setLetters = (key: "firstName" | "lastName") => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: onlyLetters(val) }));

  const setPhone = (val: string) =>
    setForm((prev) => ({ ...prev, phone: onlyNumbers(val).slice(0, 10) }));

  const handleSignup = async () => {
    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.phone ||
      !form.gender ||
      !form.dateOfBirth
    ) {
      Alert.alert("Missing details", "Please complete all required fields.");
      return;
    }

    if (!LETTERS_ONLY_REGEX.test(form.firstName.trim()) || !LETTERS_ONLY_REGEX.test(form.lastName.trim())) {
      Alert.alert("Invalid name", "First name and last name should contain only letters.");
      return;
    }

    if (!VALID_GENDERS.has(form.gender.trim().toUpperCase())) {
      Alert.alert("Invalid gender", "Gender must be MALE, FEMALE, or OTHER.");
      return;
    }

    if (!DATE_REGEX.test(form.dateOfBirth.trim())) {
      Alert.alert("Invalid date", "Date of birth must be in YYYY-MM-DD format.");
      return;
    }

    if (isFutureDate(form.dateOfBirth.trim())) {
      Alert.alert("Invalid date", "Date of birth cannot be in the future.");
      return;
    }

    if (!PHONE_REGEX.test(form.phone.trim())) {
      Alert.alert("Invalid phone", "Phone number must contain exactly 10 digits.");
      return;
    }

    try {
      setLoading(true);
      await signupApi({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        gender: form.gender.trim().toUpperCase(),
        dateOfBirth: form.dateOfBirth.trim(),
      });

      Alert.alert("Account created", "Temporary login credentials have been sent to your email.", [
        { text: "Sign In", onPress: () => navigation.replace(ROUTES.login) },
      ]);
    } catch (error: unknown) {
      Alert.alert("Signup failed", getErrorMessage(error, "Please try again."));
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
        <View style={styles.headerBlock}>
          <View style={styles.titleRow}>
            <Text style={styles.logoIcon}>H+</Text>
            <Text style={styles.title}>Create Account</Text>
          </View>
          <Text style={styles.subtitle}>Fill in your details to register</Text>
        </View>

        <SectionTitle title="Personal Information" />
        <InputField label="First Name *" value={form.firstName} onChangeText={setLetters("firstName")} autoCapitalize="words" leftIcon="account" />
        <InputField label="Last Name *" value={form.lastName} onChangeText={setLetters("lastName")} autoCapitalize="words" leftIcon="account" />
        <InputField label="Gender *" value={form.gender} onChangeText={set("gender")} autoCapitalize="characters" leftIcon="gender-male-female" />
        <InputField label="Date of Birth *" value={form.dateOfBirth} onChangeText={set("dateOfBirth")} placeholder="YYYY-MM-DD" leftIcon="calendar" />

        <SectionTitle title="Contact Information" />
        <InputField label="Email *" value={form.email} onChangeText={set("email")} keyboardType="email-address" autoCapitalize="none" leftIcon="email" />
        <InputField label="Phone Number * (10 digits)" value={form.phone} onChangeText={setPhone} keyboardType="phone-pad" leftIcon="phone" maxLength={10} />

        <PrimaryButton title="Create Account" onPress={handleSignup} loading={loading} />

        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.login)}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

type SectionTitleProps = Readonly<{
  title: string;
}>;

function SectionTitle({ title }: SectionTitleProps) {
  return (
    <View style={styles.sectionWrapper}>
      <View style={styles.sectionLine} />
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerBlock: {
    alignItems: "center",
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  logoIcon: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "900",
    marginRight: spacing.sm,
  },
  title: {
    color: TITLE_COLOR,
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  sectionWrapper: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  sectionLine: {
    backgroundColor: colors.border,
    flex: 1,
    height: 1,
  },
  sectionTitle: {
    color: SECTION_TEXT_COLOR,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginHorizontal: spacing.md,
    textTransform: "uppercase",
  },
  helperText: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: spacing.sm,
    marginTop: -10,
    paddingLeft: spacing.sm,
  },
  link: {
    color: colors.primary,
    fontWeight: "800",
    marginTop: spacing.md,
    textAlign: "center",
  },
});
