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
import { getProfileApi, updateMyProfileApi } from "../api/patient.api";

// ── Fields the patient is NOT allowed to edit ──────────────────────────────────
const LOCKED_FIELDS = new Set(["email", "phone"]);

// ── Dropdown options ───────────────────────────────────────────────────────────
const GENDER_OPTIONS     = ["MALE", "FEMALE", "OTHER"];
const BLOOD_OPTIONS      = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const MARITAL_OPTIONS    = ["SINGLE", "MARRIED", "DIVORCED"];

export default function ProfileScreen({ navigation }: any) {
  const [profile, setProfile]   = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [form,    setForm]      = useState<any>({});

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await getProfileApi();
      const data = res.data?.data;
      setProfile(data);
      setForm(flattenProfile(data));
    } catch {
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // Pull only editable scalar fields into the form state
  const flattenProfile = (p: any) => ({
    firstName:              p?.firstName              ?? "",
    lastName:               p?.lastName               ?? "",
    gender:                 p?.gender                 ?? "",
    dateOfBirth:            p?.dateOfBirth ? p.dateOfBirth.split("T")[0] : "",
    bloodGroup:             p?.bloodGroup             ?? "",
    maritalStatus:          p?.maritalStatus          ?? "",
    address:                p?.address                ?? "",
    city:                   p?.city                   ?? "",
    state:                  p?.state                  ?? "",
    pincode:                p?.pincode                ?? "",
    country:                p?.country                ?? "",
    emergencyContactName:   p?.emergencyContactName   ?? "",
    emergencyContactPhone:  p?.emergencyContactPhone  ?? "",
    relationship:           p?.relationship           ?? "",
    insuranceProvider:      p?.insuranceProvider      ?? "",
    insurancePolicyNumber:  p?.insurancePolicyNumber  ?? "",
    insuranceExpiryDate:    p?.insuranceExpiryDate
      ? p.insuranceExpiryDate.split("T")[0] : "",
    insuranceCoverageAmount: p?.insuranceCoverageAmount
      ? String(p.insuranceCoverageAmount) : "",
    allergies:             (p?.allergies              ?? []).join(", "),
    chronicDiseases:       (p?.chronicDiseases        ?? []).join(", "),
    currentMedications:    (p?.currentMedications     ?? []).join(", "),
    medicalHistory:         p?.medicalHistory         ?? "",
  });

  const set = (key: string, value: string) =>
    setForm((prev: any) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: any = {
        firstName:             form.firstName,
        lastName:              form.lastName,
        gender:                form.gender,
        dateOfBirth:           form.dateOfBirth,
        bloodGroup:            form.bloodGroup,
        maritalStatus:         form.maritalStatus,
        address:               form.address,
        city:                  form.city,
        state:                 form.state,
        pincode:               form.pincode,
        country:               form.country,
        emergencyContactName:  form.emergencyContactName,
        emergencyContactPhone: form.emergencyContactPhone,
        relationship:          form.relationship,
        insuranceProvider:     form.insuranceProvider,
        insurancePolicyNumber: form.insurancePolicyNumber,
        insuranceExpiryDate:   form.insuranceExpiryDate,
        insuranceCoverageAmount: form.insuranceCoverageAmount
          ? Number(form.insuranceCoverageAmount) : undefined,
        allergies:          form.allergies.split(",").map((s: string) => s.trim()).filter(Boolean),
        chronicDiseases:    form.chronicDiseases.split(",").map((s: string) => s.trim()).filter(Boolean),
        currentMedications: form.currentMedications.split(",").map((s: string) => s.trim()).filter(Boolean),
        medicalHistory:     form.medicalHistory,
      };

      await updateMyProfileApi(payload);
      Alert.alert("Success", "Profile updated successfully");
      setEditing(false);
      await loadProfile();
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(flattenProfile(profile));
    setEditing(false);
  };

  // ── Formatters ─────────────────────────────────────────────────────────────
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const initials = profile
    ? `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase()
    : "P";
  const fullName = profile
    ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
    : "";

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 12, color: "#6b7280" }}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => editing ? handleCancel() : navigation.goBack()}>
          <Text style={styles.backText}>{editing ? "✕ Cancel" : "← Back"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        {editing ? (
          <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Save"}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setEditing(true)} style={styles.editBtn}>
            <Text style={styles.editBtnText}>✏️ Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Avatar Banner */}
        <View style={styles.banner}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.fullName}>{fullName || "Patient"}</Text>
          <View style={styles.idBadge}>
            <Text style={styles.idBadgeText}>🪪 {profile?.patientId ?? "—"}</Text>
          </View>
          <View style={[styles.statusBadge,
            { backgroundColor: profile?.status === "ACTIVE" ? "#dcfce7" : "#fee2e2" }
          ]}>
            <Text style={[styles.statusText,
              { color: profile?.status === "ACTIVE" ? "#16a34a" : "#dc2626" }
            ]}>
              ● {profile?.status ?? "UNKNOWN"}
            </Text>
          </View>
          {editing && (
            <View style={styles.editingBanner}>
              <Text style={styles.editingBannerText}>✏️ Editing mode — email & phone cannot be changed</Text>
            </View>
          )}
        </View>

        {profile ? (
          <>
            {/* Personal Details */}
            <Section title="👤 Personal Details">
              <EditableRow label="First Name"  value={form.firstName}   editing={editing} onChangeText={(v) => set("firstName", v)} />
              <EditableRow label="Last Name"   value={form.lastName}    editing={editing} onChangeText={(v) => set("lastName", v)} />
              <DropdownRow  label="Gender"     value={form.gender}      editing={editing} options={GENDER_OPTIONS}  onSelect={(v) => set("gender", v)} />
              <EditableRow label="Date of Birth" value={editing ? form.dateOfBirth : formatDate(profile.dateOfBirth)}
                editing={editing} onChangeText={(v) => set("dateOfBirth", v)} placeholder="YYYY-MM-DD" />
              <DropdownRow  label="Blood Group"   value={form.bloodGroup}   editing={editing} options={BLOOD_OPTIONS}   onSelect={(v) => set("bloodGroup", v)} />
              <DropdownRow  label="Marital Status" value={form.maritalStatus} editing={editing} options={MARITAL_OPTIONS} onSelect={(v) => set("maritalStatus", v)} />
            </Section>

            {/* Contact Details — email & phone are read-only always */}
            <Section title="📞 Contact Details">
              <InfoRow label="Email" value={profile.email} locked />
              <InfoRow label="Phone" value={profile.phone} locked />
              <EditableRow label="Address" value={form.address} editing={editing} onChangeText={(v) => set("address", v)} multiline />
              <EditableRow label="City"    value={form.city}    editing={editing} onChangeText={(v) => set("city", v)} />
              <EditableRow label="State"   value={form.state}   editing={editing} onChangeText={(v) => set("state", v)} />
              <EditableRow label="Pincode" value={form.pincode} editing={editing} onChangeText={(v) => set("pincode", v)} keyboardType="numeric" />
              <EditableRow label="Country" value={form.country} editing={editing} onChangeText={(v) => set("country", v)} />
            </Section>

            {/* Emergency Contact */}
            <Section title="🚨 Emergency Contact">
              <EditableRow label="Name"         value={form.emergencyContactName}  editing={editing} onChangeText={(v) => set("emergencyContactName", v)} />
              <EditableRow label="Phone"        value={form.emergencyContactPhone} editing={editing} onChangeText={(v) => set("emergencyContactPhone", v)} keyboardType="phone-pad" />
              <EditableRow label="Relationship" value={form.relationship}          editing={editing} onChangeText={(v) => set("relationship", v)} />
            </Section>

            {/* Insurance */}
            <Section title="🏥 Insurance">
              <EditableRow label="Provider"      value={form.insuranceProvider}     editing={editing} onChangeText={(v) => set("insuranceProvider", v)} />
              <EditableRow label="Policy Number" value={form.insurancePolicyNumber} editing={editing} onChangeText={(v) => set("insurancePolicyNumber", v)} />
              <EditableRow label="Expiry"        value={editing ? form.insuranceExpiryDate : formatDate(profile.insuranceExpiryDate)}
                editing={editing} onChangeText={(v) => set("insuranceExpiryDate", v)} placeholder="YYYY-MM-DD" />
              <EditableRow label="Coverage (₹)"  value={form.insuranceCoverageAmount} editing={editing} onChangeText={(v) => set("insuranceCoverageAmount", v)} keyboardType="numeric" />
            </Section>

            {/* Medical Info */}
            <Section title="🩺 Medical Information">
              <EditableRow label="Allergies"        value={form.allergies}          editing={editing} onChangeText={(v) => set("allergies", v)}
                placeholder="Comma-separated" hint="e.g. Penicillin, Dust" />
              <EditableRow label="Chronic Diseases" value={form.chronicDiseases}    editing={editing} onChangeText={(v) => set("chronicDiseases", v)}
                placeholder="Comma-separated" />
              <EditableRow label="Medications"      value={form.currentMedications} editing={editing} onChangeText={(v) => set("currentMedications", v)}
                placeholder="Comma-separated" />
              <EditableRow label="Medical History"  value={form.medicalHistory}     editing={editing} onChangeText={(v) => set("medicalHistory", v)} multiline />
            </Section>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No profile data found.</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value, locked }: { label: string; value?: string; locked?: boolean }) {
  if (!value && !locked) return null;
  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.labelWrap}>
        <Text style={rowStyles.label}>{label}</Text>
        {locked && <Text style={rowStyles.lockIcon}>🔒</Text>}
      </View>
      <Text style={rowStyles.value}>{value || "—"}</Text>
    </View>
  );
}

function EditableRow({
  label, value, editing, onChangeText, multiline, keyboardType, placeholder, hint,
}: {
  label: string; value: string; editing: boolean;
  onChangeText: (v: string) => void;
  multiline?: boolean; keyboardType?: any; placeholder?: string; hint?: string;
}) {
  if (!editing && (!value || value === "—")) return null;
  return (
    <View style={[rowStyles.row, multiline && { alignItems: "flex-start" }]}>
      <Text style={rowStyles.label}>{label}</Text>
      {editing ? (
        <View style={rowStyles.inputWrap}>
          <TextInput
            style={[rowStyles.input, multiline && rowStyles.multilineInput]}
            value={value}
            onChangeText={onChangeText}
            multiline={multiline}
            keyboardType={keyboardType ?? "default"}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            placeholderTextColor="#9ca3af"
          />
          {hint ? <Text style={rowStyles.hint}>{hint}</Text> : null}
        </View>
      ) : (
        <Text style={rowStyles.value}>{value || "—"}</Text>
      )}
    </View>
  );
}

function DropdownRow({
  label, value, editing, options, onSelect,
}: {
  label: string; value: string; editing: boolean;
  options: string[]; onSelect: (v: string) => void;
}) {
  if (!editing && (!value || value === "—")) return null;
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      {editing ? (
        <View style={rowStyles.inputWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    dropStyles.chip,
                    value === opt && dropStyles.chipActive,
                  ]}
                  onPress={() => onSelect(opt)}
                >
                  <Text style={[
                    dropStyles.chipText,
                    value === opt && dropStyles.chipTextActive,
                  ]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      ) : (
        <Text style={rowStyles.value}>{value || "—"}</Text>
      )}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: "#f0f4ff" },
  centered:  { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1e3a8a",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backText:    { color: "#fff", fontSize: 15, fontWeight: "bold", width: 80 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },

  editBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  saveBtn: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  saveBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  banner: {
    backgroundColor: "#1e3a8a",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 4,
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#3b82f6",
    justifyContent: "center", alignItems: "center",
    borderWidth: 3, borderColor: "#93c5fd",
    marginBottom: 12,
  },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  fullName:   { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 6 },
  idBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14, paddingVertical: 4,
    borderRadius: 20, marginBottom: 8,
  },
  idBadgeText: { color: "#e0f2fe", fontSize: 13 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 3, borderRadius: 20, marginBottom: 8 },
  statusText:  { fontSize: 12, fontWeight: "bold" },

  editingBanner: {
    backgroundColor: "rgba(251,191,36,0.2)",
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, marginTop: 4,
  },
  editingBannerText: { color: "#fde68a", fontSize: 11, textAlign: "center" },

  emptyState: { alignItems: "center", marginTop: 60 },
  emptyIcon:  { fontSize: 40, marginBottom: 12 },
  emptyText:  { color: "#6b7280", fontSize: 15 },
});

const sectionStyles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    marginHorizontal: 16, marginTop: 14,
    borderRadius: 16, padding: 16,
    elevation: 2,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 14, fontWeight: "bold",
    color: "#1e3a8a", marginBottom: 12, letterSpacing: 0.3,
  },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  labelWrap:  { flexDirection: "row", alignItems: "center", flex: 1, gap: 4 },
  label:      { fontSize: 13, color: "#6b7280", fontWeight: "600", flex: 1 },
  lockIcon:   { fontSize: 11 },
  value:      { fontSize: 13, color: "#111827", flex: 1.5, textAlign: "right" },
  inputWrap:  { flex: 1.5 },
  input: {
    borderWidth: 1, borderColor: "#d1d5db",
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    fontSize: 13, color: "#111827", backgroundColor: "#f9fafb",
    textAlign: "right",
  },
  multilineInput: { height: 72, textAlignVertical: "top", textAlign: "left" },
  hint: { fontSize: 10, color: "#9ca3af", marginTop: 2, textAlign: "right" },
});

const dropStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 16, borderWidth: 1, borderColor: "#d1d5db",
    backgroundColor: "#f9fafb",
  },
  chipActive: { backgroundColor: "#1e3a8a", borderColor: "#1e3a8a" },
  chipText:      { fontSize: 12, color: "#374151", fontWeight: "600" },
  chipTextActive: { color: "#fff" },
});