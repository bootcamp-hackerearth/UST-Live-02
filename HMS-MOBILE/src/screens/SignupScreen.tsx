import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { signupApi } from "../api/auth.api";
import PrimaryButton from "../components/PrimaryButton";

// ── Types ──────────────────────────────────────────────────────────────────────
type Form = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
};

type Errors = Partial<Record<keyof Form, string>>;

// ── Helpers ────────────────────────────────────────────────────────────────────
const EMAIL_RE   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE   = /^\d{10}$/;
const LETTERS_RE = /^[A-Za-z\s'-]+$/; // only letters, spaces, hyphens, apostrophes

const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const displayDate = (dateStr: string): string => {
  if (!dateStr) return "Select date of birth";
  const [y, m, d] = dateStr.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d} ${months[parseInt(m) - 1]} ${y}`;
};

// ── Component ──────────────────────────────────────────────────────────────────
export default function SignupScreen({ navigation }: any) {
  const [form, setForm] = useState<Form>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "MALE",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading]                         = useState(false);
  const [errors, setErrors]                           = useState<Errors>({});
  const [showDatePicker, setShowDatePicker]           = useState(false);
  const [pickerDate, setPickerDate]                   = useState(new Date(2000, 0, 1));

  const set = (key: keyof Form) => (val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // ── Date picker handler ───────────────────────────────────────────────────────
  const onDateChange = (_: any, selected?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (selected) {
      setPickerDate(selected);
      const formatted = formatDate(selected);
      setForm((prev) => ({ ...prev, dateOfBirth: formatted }));
      if (errors.dateOfBirth) setErrors((e) => ({ ...e, dateOfBirth: undefined }));
    }
  };

  // ── Validation ────────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Errors = {};

    // First name
    if (!form.firstName.trim())
      e.firstName = "First name is required";
    else if (form.firstName.trim().length < 2)
      e.firstName = "Must be at least 2 characters";
    else if (!LETTERS_RE.test(form.firstName))
      e.firstName = "First name must contain letters only";

    // Last name
    if (!form.lastName.trim())
      e.lastName = "Last name is required";
    else if (!LETTERS_RE.test(form.lastName))
      e.lastName = "Last name must contain letters only";
    else if (form.lastName.trim().toLowerCase() === form.firstName.trim().toLowerCase())
      e.lastName = "Last name cannot be the same as first name";

    // Email
    if (!form.email.trim())
      e.email = "Email is required";
    else if (!EMAIL_RE.test(form.email))
      e.email = "Enter a valid email address";

    // Phone
    if (!form.phone.trim())
      e.phone = "Phone number is required";
    else if (!PHONE_RE.test(form.phone))
      e.phone = "Enter a valid 10-digit phone number";

    // Gender
    if (!form.gender)
      e.gender = "Please select a gender";

    // Date of birth
    if (!form.dateOfBirth)
      e.dateOfBirth = "Date of birth is required";
    else {
      const dob   = new Date(form.dateOfBirth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dob >= today)
        e.dateOfBirth = "Date of birth must be in the past";
    }

    // Password
    if (!form.password)
      e.password = "Password is required";
    else if (form.password.length < 8)
      e.password = "Password must be at least 8 characters";
    else if (!/[A-Z]/.test(form.password))
      e.password = "Include at least one uppercase letter";
    else if (!/[0-9]/.test(form.password))
      e.password = "Include at least one number";

    // Confirm password
    if (!form.confirmPassword)
      e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSignup = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await signupApi(form);
      Alert.alert("Account Created", "You can now log in.", [
        { text: "Go to Login", onPress: () => navigation.replace("Login") },
      ]);
    } catch (err: any) {
      Alert.alert("Signup Failed", err.response?.data?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <Text style={styles.title}>🏥 Create Account</Text>
        <Text style={styles.subtitle}>Fill in your details to register</Text>

        {/* ── Personal Info ── */}
        <SectionLabel text="Personal Information" />

        <Field
          label="First Name *"
          value={form.firstName}
          onChangeText={set("firstName")}
          autoCapitalize="words"
          icon="account"
          error={errors.firstName}
        />

        <Field
          label="Last Name *"
          value={form.lastName}
          onChangeText={set("lastName")}
          autoCapitalize="words"
          icon="account"
          error={errors.lastName}
        />

        {/* Gender Dropdown */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.dropdownLabel}>Gender *</Text>
          <View style={[styles.pickerContainer, errors.gender ? styles.pickerError : null]}>
            <Picker
              selectedValue={form.gender}
              onValueChange={(val) => set("gender")(val)}
              style={styles.picker}
            >
              <Picker.Item label="Male"   value="MALE"   />
              <Picker.Item label="Female" value="FEMALE" />
              <Picker.Item label="Other"  value="OTHER"  />
            </Picker>
          </View>
          {errors.gender ? <ErrorText msg={errors.gender} /> : null}
        </View>

        {/* Date of Birth — Calendar Picker */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.dropdownLabel}>Date of Birth *</Text>
          <TouchableOpacity
            style={[styles.dateButton, errors.dateOfBirth ? styles.dateButtonError : null]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.dateIcon}>📅</Text>
            <Text style={[styles.dateText, !form.dateOfBirth && styles.datePlaceholder]}>
              {displayDate(form.dateOfBirth)}
            </Text>
            <Text style={styles.dateChevron}>▾</Text>
          </TouchableOpacity>
          {errors.dateOfBirth ? <ErrorText msg={errors.dateOfBirth} /> : null}
        </View>

        {/* Date picker — Android shows inline, iOS shows inline too */}
        {showDatePicker && (
          <View style={styles.datePickerWrapper}>
            <DateTimePicker
              value={pickerDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "calendar"}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
              onChange={onDateChange}
            />
            {/* iOS needs a Done button to dismiss */}
            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── Contact Info ── */}
        <SectionLabel text="Contact Information" />

        <Field
          label="Email *"
          value={form.email}
          onChangeText={set("email")}
          keyboardType="email-address"
          autoCapitalize="none"
          icon="email"
          error={errors.email}
        />

        <Field
          label="Phone Number * (10 digits)"
          value={form.phone}
          onChangeText={set("phone")}
          keyboardType="phone-pad"
          icon="phone"
          error={errors.phone}
          maxLength={10}
        />

        {/* ── Security ── */}
        <SectionLabel text="Security" />

        <View style={styles.fieldWrapper}>
          <TextInput
            label="Password *"
            value={form.password}
            onChangeText={set("password")}
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
          {errors.password ? <ErrorText msg={errors.password} /> : null}
          <Text style={styles.hint}>Min 8 chars, one uppercase, one number</Text>
        </View>

        <View style={styles.fieldWrapper}>
          <TextInput
            label="Confirm Password *"
            value={form.confirmPassword}
            onChangeText={set("confirmPassword")}
            secureTextEntry={!showConfirmPassword}
            mode="outlined"
            style={styles.input}
            error={!!errors.confirmPassword}
            left={<TextInput.Icon icon="lock-check" />}
            right={
              <TextInput.Icon
                icon={showConfirmPassword ? "eye-off" : "eye"}
                onPress={() => setShowConfirmPassword((s) => !s)}
              />
            }
          />
          {errors.confirmPassword ? <ErrorText msg={errors.confirmPassword} /> : null}
        </View>

        <PrimaryButton title="Create Account" onPress={handleSignup} loading={loading} />

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>
            Already have an account? <Text style={{ fontWeight: "bold" }}>Sign in</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function SectionLabel({ text }: { text: string }) {
  return (
    <View style={sectionStyles.row}>
      <View style={sectionStyles.line} />
      <Text style={sectionStyles.text}>{text}</Text>
      <View style={sectionStyles.line} />
    </View>
  );
}

function Field({ label, value, onChangeText, error, icon, hint, ...rest }: any) {
  return (
    <View style={styles.fieldWrapper}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        mode="outlined"
        style={styles.input}
        error={!!error}
        left={icon ? <TextInput.Icon icon={icon} /> : undefined}
        {...rest}
      />
      {error ? <ErrorText msg={error} /> : null}
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

function ErrorText({ msg }: { msg: string }) {
  return <Text style={styles.errorText}>⚠ {msg}</Text>;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea:    { flex: 1, backgroundColor: "#f0f4ff" },
  container:   { padding: 20, paddingBottom: 50 },
  title: {
    fontSize: 28, fontWeight: "bold", textAlign: "center",
    color: "#1e3a8a", marginTop: 10, marginBottom: 4,
  },
  subtitle: {
    textAlign: "center", color: "#6b7280", marginBottom: 24, fontSize: 14,
  },
  fieldWrapper:  { marginBottom: 12 },
  input:         { backgroundColor: "#fff" },
  errorText:     { fontSize: 12, color: "#dc2626", marginTop: 3, marginLeft: 4 },
  hint:          { fontSize: 11, color: "#9ca3af", marginTop: 3, marginLeft: 4 },
  dropdownLabel: { fontSize: 12, color: "#6b7280", marginBottom: 4, marginLeft: 2 },
  pickerContainer: {
    borderWidth: 1, borderColor: "#d1d5db",
    borderRadius: 8, backgroundColor: "#fff", overflow: "hidden",
  },
  pickerError: { borderColor: "#dc2626" },
  picker:      { height: Platform.OS === "ios" ? 150 : 50 },

  // Date button
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dateButtonError: { borderColor: "#dc2626" },
  dateIcon:        { fontSize: 16, marginRight: 10 },
  dateText:        { flex: 1, fontSize: 15, color: "#111827" },
  datePlaceholder: { color: "#9ca3af" },
  dateChevron:     { fontSize: 12, color: "#6b7280" },

  // Date picker container
  datePickerWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
    overflow: "hidden",
  },
  doneButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    alignItems: "center",
  },
  doneButtonText: { color: "#fff", fontWeight: "bold", fontSize: 15 },

  link: { marginTop: 20, textAlign: "center", color: "#374151", fontSize: 14 },
});

const sectionStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginVertical: 16 },
  line: { flex: 1, height: 1, backgroundColor: "#e5e7eb" },
  text: {
    fontSize: 12, fontWeight: "600", color: "#6b7280",
    marginHorizontal: 10, textTransform: "uppercase", letterSpacing: 0.8,
  },
});