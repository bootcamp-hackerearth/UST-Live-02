import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getProfileApi, updateProfileApi } from "../api/patient.api";
import ScreenHeader from "../components/ScreenHeader";
import { colors, radius, shadow, spacing } from "../theme";
import {
  LETTERS_ONLY_REGEX,
  PHONE_REGEX,
  onlyLetters,
  onlyNumbers,
} from "../utils/validation";

export default function ProfileScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ── Edit mode state ────────────────────────────────────────────────────────
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    bloodGroup: "",
    gender: "",
    allergies: "",
    insuranceProvider: "",
  });

  // ── Load profile ───────────────────────────────────────────────────────────
  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await getProfileApi();
      if (res.data.success) {
        const data = res.data.data;
        setProfile(data);
        setForm({
          firstName:         data.firstName         ?? "",
          lastName:          data.lastName          ?? "",
          phone:             data.phone             ?? "",
          email:             data.email             ?? "",
          address:           data.address           ?? "",
          bloodGroup:        data.bloodGroup        ?? "",
          gender:            data.gender            ?? "",
          allergies:         Array.isArray(data.allergies)
                               ? data.allergies.join(", ")
                               : (data.allergies ?? ""),
          insuranceProvider: data.insuranceProvider ?? "",
        });
      } else {
        Alert.alert("Error", res.data.message || "Failed to load profile");
      }
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // ── Save edits ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.firstName.trim()) {
      Alert.alert("Required", "First name cannot be empty.");
      return;
    }

    if (
      !LETTERS_ONLY_REGEX.test(form.firstName.trim()) ||
      (form.lastName.trim() && !LETTERS_ONLY_REGEX.test(form.lastName.trim()))
    ) {
      Alert.alert("Invalid name", "First name and last name should contain only letters.");
      return;
    }

    if (form.gender.trim() && !["MALE", "FEMALE", "OTHER"].includes(form.gender.trim().toUpperCase())) {
      Alert.alert("Invalid gender", "Gender must be MALE, FEMALE, or OTHER.");
      return;
    }

    if (form.phone.trim() && !PHONE_REGEX.test(form.phone.trim())) {
      Alert.alert("Invalid phone", "Phone number must contain exactly 10 digits.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...form,
        allergies: form.allergies
          ? form.allergies.split(",").map((a) => a.trim()).filter(Boolean)
          : [],
      };
      const res = await updateProfileApi(payload);
      if (res.data.success) {
        setProfile(res.data.data);
        setEditMode(false);
        Alert.alert("Success", "Profile updated successfully.");
      } else {
        Alert.alert("Error", res.data.message || "Update failed");
      }
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setForm({
        firstName:         profile.firstName         ?? "",
        lastName:          profile.lastName          ?? "",
        phone:             profile.phone             ?? "",
        email:             profile.email             ?? "",
        address:           profile.address           ?? "",
        bloodGroup:        profile.bloodGroup        ?? "",
        gender:            profile.gender            ?? "",
        allergies:         Array.isArray(profile.allergies)
                             ? profile.allergies.join(", ")
                             : (profile.allergies ?? ""),
        insuranceProvider: profile.insuranceProvider ?? "",
      });
    }
    setEditMode(false);
  };

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setLettersField = (key: "firstName" | "lastName") => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: onlyLetters(value) }));
  };

  const setPhoneField = (value: string) => {
    setForm((prev) => ({ ...prev, phone: onlyNumbers(value).slice(0, 10) }));
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>

      <ScreenHeader
        title="My Profile"
        onBack={() => navigation.goBack()}
        actionLabel={!loading && profile ? (editMode ? "Cancel" : "Edit") : undefined}
        onAction={!loading && profile ? () => (editMode ? handleCancelEdit() : setEditMode(true)) : undefined}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : !profile ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>Profile</Text>
          <Text style={styles.emptyText}>Profile not found.</Text>
        </View>
      ) : editMode ? (

        /* ── EDIT MODE ──────────────────────────────────────────────────── */
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >

          <View style={styles.editBanner}>
            <Text style={styles.editBannerText}>Editing profile. Tap Cancel to discard changes.</Text>
          </View>

          <SectionCard title="Personal Information">
            <EditField
              label="First Name"
              value={form.firstName}
              onChangeText={setLettersField("firstName")}
              placeholder="Enter first name"
            />
            <EditField
              label="Last Name"
              value={form.lastName}
              onChangeText={setLettersField("lastName")}
              placeholder="Enter last name"
            />
            <EditField
              label="Gender"
              value={form.gender}
              onChangeText={(v) => setField("gender", v)}
              placeholder="Male / Female / Other"
            />
            <EditField
              label="Blood Group"
              value={form.bloodGroup}
              onChangeText={(v) => setField("bloodGroup", v)}
              placeholder="e.g. A+, B-, O+"
            />
          </SectionCard>

          <SectionCard title="Contact Information">
            <EditField
              label="Phone"
              value={form.phone}
              onChangeText={setPhoneField}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              autoCapitalize="none"
              maxLength={10}
            />
            <EditField
              label="Email"
              value={form.email}
              onChangeText={(v) => setField("email", v)}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <EditField
              label="Address"
              value={form.address}
              onChangeText={(v) => setField("address", v)}
              placeholder="Enter address"
              multiline
            />
          </SectionCard>

          <SectionCard title="Medical Information">
            <EditField
              label="Allergies (comma-separated)"
              value={form.allergies}
              onChangeText={(v) => setField("allergies", v)}
              placeholder="e.g. Penicillin, Pollen"
            />
            <EditField
              label="Insurance Provider"
              value={form.insuranceProvider}
              onChangeText={(v) => setField("insuranceProvider", v)}
              placeholder="Enter insurance provider"
            />
          </SectionCard>

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>

      ) : (

        /* ── VIEW MODE ──────────────────────────────────────────────────── */
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.body}
          nestedScrollEnabled
        >

          {/* Avatar + Name */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {profile.firstName?.charAt(0).toUpperCase() ?? "P"}
              </Text>
            </View>
            <Text style={styles.profileName}>{formatPatientName(profile)}</Text>
            <Text style={styles.profileId}>ID: {profile.patientId ?? profile._id}</Text>
          </View>

          <SectionCard title="Personal Information">
            <InfoRow label="Full Name"     value={formatPatientName(profile)} />
            <InfoRow label="Gender"        value={profile.gender} />
            <InfoRow
              label="Date of Birth"
              value={
                profile.dateOfBirth
                  ? new Date(profile.dateOfBirth).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "long", year: "numeric",
                    })
                  : undefined
              }
            />
            <InfoRow label="Blood Group"   value={profile.bloodGroup} />
          </SectionCard>

          <SectionCard title="Contact Information">
            <InfoRow label="Phone"   value={profile.phone} />
            <InfoRow label="Email"   value={profile.email} />
            <InfoRow label="Address" value={profile.address} />
          </SectionCard>

          <SectionCard title="Medical Information">
            <InfoRow label="Assigned Doctor" value={profile.assignedDoctor?.name} />
            <InfoRow
              label="Allergies"
              value={
                Array.isArray(profile.allergies) && profile.allergies.length > 0
                  ? profile.allergies.join(", ")
                  : undefined
              }
            />
            <InfoRow
              label="Medical History"
              value={
                Array.isArray(profile.medicalHistory) && profile.medicalHistory.length > 0
                  ? profile.medicalHistory.join(", ")
                  : undefined
              }
            />
            <InfoRow label="Insurance" value={profile.insuranceProvider} />
          </SectionCard>

          <SectionCard title="Account">
            <InfoRow label="Status" value={profile.status} />
            <InfoRow
              label="Joined"
              value={
                profile.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "long", year: "numeric",
                    })
                  : undefined
              }
            />
          </SectionCard>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
const formatPatientName = (patient?: any) => {
  const name = [patient?.firstName, patient?.lastName].filter(Boolean).join(" ");
  return name || "Patient";
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.divider} />
      {children}
    </View>
  );
}

// ─── View mode row ────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value ?? "-"}</Text>
    </View>
  );
}

// ─── Edit mode field ──────────────────────────────────────────────────────────
function EditField({
  label, value, onChangeText, placeholder, keyboardType, autoCapitalize, multiline, maxLength,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
  autoCapitalize?: any;
  multiline?: boolean;
  maxLength?: number;
}) {
  return (
    <View style={styles.editFieldWrapper}>
      <Text style={styles.editFieldLabel}>{label}</Text>
      <TextInput
        style={[styles.editFieldInput, multiline && styles.editFieldInputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType ?? "default"}
        autoCapitalize={autoCapitalize ?? "words"}
        multiline={multiline ?? false}
        maxLength={maxLength}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const BLUE       = colors.primary;
const BLUE_LIGHT = colors.primaryLight;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: BLUE, paddingHorizontal: 16, paddingVertical: 16,
  },
  backText:      { color: "#fff", fontSize: 16, fontWeight: "bold", width: 60 },
  headerTitle:   { color: "#fff", fontSize: 20, fontWeight: "bold" },
  editToggleBtn: {
    backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 8,
  },
  editToggleText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  body: { flexGrow: 1, padding: spacing.lg, paddingBottom: spacing.xl },

  empty: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    margin: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.xl,
  },
  emptyIcon: { color: colors.text, fontSize: 18, fontWeight: "900", marginBottom: 8 },
  emptyText: { fontSize: 14, color: colors.textMuted },

  avatarSection: {
    alignItems: "center",
    backgroundColor: colors.primaryDark,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    paddingVertical: spacing.xl,
    ...shadow,
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.16)", alignItems: "center",
    justifyContent: "center", marginBottom: 12,
    borderColor: "rgba(255,255,255,0.35)",
    borderWidth: 2,
  },
  avatarText:  { fontSize: 34, color: "#fff", fontWeight: "bold" },
  profileName: { fontSize: 22, fontWeight: "900", color: "#ffffff", marginBottom: 4 },
  profileId:   { fontSize: 12, color: "#c8d8ff", fontWeight: "700" },

  editBanner: {
    backgroundColor: colors.warningLight, borderRadius: radius.md, padding: 12,
    marginBottom: 14, alignItems: "center",
    borderWidth: 1, borderColor: "#f7d169",
  },
  editBannerText: { color: "#92400e", fontWeight: "700", fontSize: 13 },

  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadow,
  },
  cardTitle: { fontSize: 14, fontWeight: "900", color: colors.primary, marginBottom: 10 },
  divider:   { height: 1, backgroundColor: colors.border, marginBottom: 10 },

  infoRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", paddingVertical: 7,
    borderBottomWidth: 1, borderBottomColor: colors.surfaceMuted,
  },
  infoLabel: { fontSize: 13, color: colors.textMuted, fontWeight: "700", flex: 1 },
  infoValue: { fontSize: 13, color: colors.text, flex: 1.5, textAlign: "right", fontWeight: "600" },

  editFieldWrapper: { marginBottom: 14 },
  editFieldLabel:   { fontSize: 12, fontWeight: "800", color: colors.textMuted, marginBottom: 5 },
  editFieldInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: 13, paddingVertical: 11,
    fontSize: 14, color: colors.text, backgroundColor: colors.surfaceMuted,
  },
  editFieldInputMultiline: { minHeight: 80, textAlignVertical: "top" },

  saveBtn: {
    marginTop: 8, backgroundColor: BLUE, borderRadius: 12,
    paddingVertical: 15, alignItems: "center",
    elevation: 3, shadowColor: BLUE, shadowOpacity: 0.3,
    shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText:     { color: "#fff", fontWeight: "bold", fontSize: 15 },
});
