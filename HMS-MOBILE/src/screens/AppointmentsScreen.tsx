import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getMyAppointmentsApi, updateAppointmentApi, getAvailableSlotsApi } from "../api/appointment.api";
import { getProfileApi } from "../api/patient.api";

// ── Constants ──────────────────────────────────────────────────────────────────
const TYPE_OPTIONS     = ["CONSULTATION", "FOLLOW_UP", "EMERGENCY", "VIDEO_CONSULTATION", "ROUTINE_CHECKUP"];
const PRIORITY_OPTIONS = ["NORMAL", "URGENT", "CRITICAL"];
const VISIT_OPTIONS    = ["OFFLINE", "ONLINE", "HOME_VISIT"];

// Statuses the patient cannot edit (already acted upon)
const LOCKED_STATUSES  = new Set(["COMPLETED", "CANCELLED", "IN_CONSULTATION"]);

export default function AppointmentsScreen({ navigation }: any) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [patientMongoId, setPatientMongoId] = useState<string>("");

  // Edit modal state
  const [editTarget,   setEditTarget]   = useState<any>(null);   // appointment being edited
  const [editForm,     setEditForm]     = useState<any>({});
  const [slots,        setSlots]        = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [saving,       setSaving]       = useState(false);

  useEffect(() => { loadAppointments(); }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const profileRes = await getProfileApi();
      const patient = profileRes.data?.data;
      if (!patient?._id) { Alert.alert("Error", "Could not find your patient profile."); return; }
      setPatientMongoId(patient._id);
      const res = await getMyAppointmentsApi(patient._id);
      setAppointments(res.data?.data ?? []);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  // ── Open edit modal ──────────────────────────────────────────────────────────
  const openEdit = (appt: any) => {
    if (LOCKED_STATUSES.has(appt.status?.toUpperCase())) {
      Alert.alert("Cannot Edit", `Appointments with status "${appt.status}" cannot be modified.`);
      return;
    }
    if (appt.approvalStatus === "APPROVED") {
      Alert.alert("Cannot Edit", "This appointment has already been approved and cannot be edited.");
      return;
    }
    setEditTarget(appt);
    setEditForm({
      appointmentDate: appt.appointmentDate
        ? new Date(appt.appointmentDate).toISOString().split("T")[0]
        : "",
      timeSlot:        appt.timeSlot        ?? "",
      appointmentType: appt.appointmentType ?? "CONSULTATION",
      priority:        appt.priority        ?? "NORMAL",
      visitMode:       appt.visitMode       ?? "OFFLINE",
      notes:           appt.notes           ?? "",
      symptoms:        Array.isArray(appt.symptoms) ? appt.symptoms.join(", ") : "",
    });
    setSlots([]);
  };

  const closeEdit = () => { setEditTarget(null); setEditForm({}); setSlots([]); };

  // ── Fetch available slots when date changes ──────────────────────────────────
  const handleDateChange = async (date: string) => {
    setEditForm((p: any) => ({ ...p, appointmentDate: date, timeSlot: "" }));
    if (!date || !editTarget) { setSlots([]); return; }
    const doctorId = editTarget.doctorEmployeeId?._id ?? editTarget.doctorEmployeeId;
    if (!doctorId) return;

    // Basic date format check before hitting API
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;

    try {
      setSlotsLoading(true);
      const res = await getAvailableSlotsApi(doctorId, date);
      const available: string[] = res.data?.data ?? [];
      // Also include the currently-booked slot so the patient can "keep" it
      const current = editTarget.timeSlot;
      if (current && !available.includes(current)) {
        setSlots([current, ...available]);
      } else {
        setSlots(available);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to fetch slots";
      Alert.alert("Availability", msg);
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editForm.appointmentDate) { Alert.alert("Validation", "Please select a date."); return; }
    if (!editForm.timeSlot)        { Alert.alert("Validation", "Please select a time slot."); return; }

    try {
      setSaving(true);
      await updateAppointmentApi(editTarget._id, {
        appointmentDate: editForm.appointmentDate,
        timeSlot:        editForm.timeSlot,
        appointmentType: editForm.appointmentType,
        priority:        editForm.priority,
        visitMode:       editForm.visitMode,
        notes:           editForm.notes,
        symptoms:        editForm.symptoms.split(",").map((s: string) => s.trim()).filter(Boolean),
      });
      Alert.alert("Success", "Appointment updated successfully");
      closeEdit();
      await loadAppointments();
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to update appointment");
    } finally {
      setSaving(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const statusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":       return "#10b981";
      case "PENDING":
      case "BOOKED":          return "#f59e0b";
      case "CANCELLED":       return "#ef4444";
      case "COMPLETED":       return "#6b7280";
      case "IN_CONSULTATION": return "#3b82f6";
      default:                return "#9ca3af";
    }
  };

  const canEdit = (appt: any) =>
    !LOCKED_STATUSES.has(appt.status?.toUpperCase()) && appt.approvalStatus !== "APPROVED";

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading appointments...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {appointments.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>No Appointments Found</Text>
              <Text style={styles.emptySubtitle}>You haven't booked any appointments yet.</Text>
            </View>
          ) : (
            appointments.map((appt) => (
              <View key={appt._id} style={styles.card}>
                <View style={[styles.statusBar, { backgroundColor: statusColor(appt.status) }]} />
                <View style={styles.cardContent}>

                  {/* Top row */}
                  <View style={styles.cardTop}>
                    <Text style={styles.apptId}>{appt.appointmentId}</Text>
                    <View style={[styles.badge, { backgroundColor: statusColor(appt.status) + "20" }]}>
                      <Text style={[styles.badgeText, { color: statusColor(appt.status) }]}>
                        {appt.status}
                      </Text>
                    </View>
                  </View>

                  {/* Doctor — read-only */}
                  <Text style={styles.doctorName}>
                    👨‍⚕️ {appt.doctorEmployeeId?.name ?? "Doctor"}
                  </Text>

                  <View style={styles.divider} />

                  {/* Details chips */}
                  <View style={styles.detailsRow}>
                    <DetailChip icon="📅" value={new Date(appt.appointmentDate).toLocaleDateString("en-IN",
                      { day: "2-digit", month: "short", year: "numeric" })} />
                    <DetailChip icon="🕐" value={appt.timeSlot} />
                    <DetailChip icon="🏷️" value={appt.appointmentType} />
                    <DetailChip icon="📍" value={appt.visitMode} />
                  </View>

                  {appt.notes ? <Text style={styles.notes}>📝 {appt.notes}</Text> : null}

                  {/* Approval badge */}
                  <View style={styles.cardFooter}>
                    <Text style={[styles.approvalBadge,
                      appt.approvalStatus === "APPROVED"
                        ? styles.approvalApproved
                        : appt.approvalStatus === "REJECTED"
                        ? styles.approvalRejected
                        : styles.approvalPending
                    ]}>
                      {appt.approvalStatus === "APPROVED" ? "✓ Approved"
                        : appt.approvalStatus === "REJECTED" ? "✗ Rejected"
                        : "⏳ Pending approval"}
                    </Text>

                    {canEdit(appt) && (
                      <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => openEdit(appt)}
                      >
                        <Text style={styles.editBtnText}>✏️ Edit</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* ── Edit Modal ── */}
      <Modal visible={!!editTarget} animationType="slide" transparent>
        <View style={modal.overlay}>
          <View style={modal.sheet}>
            <View style={modal.sheetHeader}>
              <Text style={modal.sheetTitle}>Edit Appointment</Text>
              <TouchableOpacity onPress={closeEdit}>
                <Text style={modal.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

              {/* Doctor — display only */}
              <ModalSection title="Doctor (fixed)">
                <Text style={modal.doctorName}>
                  👨‍⚕️ {editTarget?.doctorEmployeeId?.name ?? "Doctor"}
                </Text>
                <Text style={modal.doctorNote}>The doctor cannot be changed.</Text>
              </ModalSection>

              {/* Date */}
              <ModalSection title="Appointment Date *">
                <TextInput
                  style={modal.input}
                  value={editForm.appointmentDate}
                  onChangeText={handleDateChange}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9ca3af"
                />
              </ModalSection>

              {/* Time Slot */}
              <ModalSection title="Time Slot *">
                {!editForm.appointmentDate ? (
                  <Text style={modal.hintText}>Enter a date above to see available slots.</Text>
                ) : slotsLoading ? (
                  <ActivityIndicator size="small" color="#2563eb" style={{ marginVertical: 8 }} />
                ) : slots.length === 0 ? (
                  <Text style={modal.hintText}>No slots available for this date.</Text>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={modal.chipRow}>
                      {slots.map((slot) => (
                        <TouchableOpacity
                          key={slot}
                          style={[modal.chip, editForm.timeSlot === slot && modal.chipActive]}
                          onPress={() => setEditForm((p: any) => ({ ...p, timeSlot: slot }))}
                        >
                          <Text style={[modal.chipText, editForm.timeSlot === slot && modal.chipTextActive]}>
                            🕐 {slot}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                )}
              </ModalSection>

              {/* Type */}
              <ModalSection title="Appointment Type">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={modal.chipRow}>
                    {TYPE_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        style={[modal.chip, editForm.appointmentType === opt && modal.chipActive]}
                        onPress={() => setEditForm((p: any) => ({ ...p, appointmentType: opt }))}
                      >
                        <Text style={[modal.chipText, editForm.appointmentType === opt && modal.chipTextActive]}>
                          {opt.replace("_", " ")}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </ModalSection>

              {/* Priority */}
              <ModalSection title="Priority">
                <View style={modal.chipRow}>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[modal.chip, editForm.priority === opt && modal.chipActive]}
                      onPress={() => setEditForm((p: any) => ({ ...p, priority: opt }))}
                    >
                      <Text style={[modal.chipText, editForm.priority === opt && modal.chipTextActive]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ModalSection>

              {/* Visit Mode */}
              <ModalSection title="Visit Mode">
                <View style={modal.chipRow}>
                  {VISIT_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[modal.chip, editForm.visitMode === opt && modal.chipActive]}
                      onPress={() => setEditForm((p: any) => ({ ...p, visitMode: opt }))}
                    >
                      <Text style={[modal.chipText, editForm.visitMode === opt && modal.chipTextActive]}>
                        {opt.replace("_", " ")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ModalSection>

              {/* Symptoms */}
              <ModalSection title="Symptoms (comma-separated)">
                <TextInput
                  style={modal.input}
                  value={editForm.symptoms}
                  onChangeText={(v) => setEditForm((p: any) => ({ ...p, symptoms: v }))}
                  placeholder="e.g. Fever, Headache"
                  placeholderTextColor="#9ca3af"
                />
              </ModalSection>

              {/* Notes */}
              <ModalSection title="Notes">
                <TextInput
                  style={[modal.input, { height: 80, textAlignVertical: "top" }]}
                  value={editForm.notes}
                  onChangeText={(v) => setEditForm((p: any) => ({ ...p, notes: v }))}
                  placeholder="Any additional notes..."
                  placeholderTextColor="#9ca3af"
                  multiline
                />
              </ModalSection>

              <View style={{ height: 16 }} />
            </ScrollView>

            {/* Action buttons */}
            <View style={modal.actions}>
              <TouchableOpacity style={modal.cancelBtn} onPress={closeEdit}>
                <Text style={modal.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modal.saveBtn, saving && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={modal.saveText}>{saving ? "Saving…" : "Save Changes"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function DetailChip({ icon, value }: { icon: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={chipStyles.chip}>
      <Text style={chipStyles.icon}>{icon}</Text>
      <Text style={chipStyles.text}>{value}</Text>
    </View>
  );
}

function ModalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={modal.section}>
      <Text style={modal.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea:    { flex: 1, backgroundColor: "#f0f4ff" },
  centered:    { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 60 },
  loadingText: { marginTop: 12, color: "#6b7280", fontSize: 14 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#1e3a8a", paddingHorizontal: 16, paddingVertical: 16,
  },
  backText:    { color: "#fff", fontSize: 16, fontWeight: "bold", width: 60 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },

  list:  { padding: 16, paddingBottom: 40 },

  empty: { alignItems: "center", marginTop: 80 },
  emptyIcon:     { fontSize: 52, marginBottom: 14 },
  emptyTitle:    { fontSize: 17, fontWeight: "bold", color: "#1f2937", marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: "#9ca3af", textAlign: "center" },

  card: {
    backgroundColor: "#fff", borderRadius: 16, marginBottom: 14,
    flexDirection: "row", overflow: "hidden",
    elevation: 3, shadowColor: "#000", shadowOpacity: 0.07,
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  statusBar:   { width: 5 },
  cardContent: { flex: 1, padding: 14 },

  cardTop: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 4,
  },
  apptId: { fontSize: 12, color: "#9ca3af", fontWeight: "600" },

  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "bold", textTransform: "capitalize" },

  doctorName: { fontSize: 15, fontWeight: "bold", color: "#1f2937", marginBottom: 10 },
  divider:    { height: 1, backgroundColor: "#f3f4f6", marginBottom: 10 },

  detailsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  notes:      { fontSize: 12, color: "#6b7280", marginTop: 8 },

  cardFooter: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginTop: 10,
  },
  approvalBadge:    { fontSize: 11, fontWeight: "700", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  approvalApproved: { backgroundColor: "#dcfce7", color: "#16a34a" },
  approvalRejected: { backgroundColor: "#fee2e2", color: "#dc2626" },
  approvalPending:  { backgroundColor: "#fef9c3", color: "#92400e" },

  editBtn: {
    backgroundColor: "#eff6ff", paddingHorizontal: 14,
    paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "#bfdbfe",
  },
  editBtnText: { fontSize: 12, fontWeight: "700", color: "#2563eb" },
});

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#f0f4ff", paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 20, gap: 4,
  },
  icon: { fontSize: 12 },
  text: { fontSize: 12, color: "#1e3a8a", fontWeight: "600" },
});

const modal = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: "90%",
  },
  sheetHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
  },
  sheetTitle: { fontSize: 18, fontWeight: "bold", color: "#1f2937" },
  closeBtn:   { fontSize: 20, color: "#6b7280", padding: 4 },

  section:      { marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: "#6b7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },

  doctorName: { fontSize: 15, fontWeight: "bold", color: "#1f2937", marginBottom: 4 },
  doctorNote: { fontSize: 11, color: "#9ca3af" },

  input: {
    borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: "#111827", backgroundColor: "#f9fafb",
  },

  chipRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: "#d1d5db",
    backgroundColor: "#f9fafb",
  },
  chipActive:     { backgroundColor: "#1e3a8a", borderColor: "#1e3a8a" },
  chipText:       { fontSize: 13, color: "#374151", fontWeight: "600" },
  chipTextActive: { color: "#fff" },

  hintText: { fontSize: 13, color: "#9ca3af", fontStyle: "italic" },

  actions: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, borderColor: "#d1d5db", alignItems: "center",
  },
  cancelText: { fontSize: 15, color: "#374151", fontWeight: "600" },
  saveBtn: {
    flex: 2, paddingVertical: 14, borderRadius: 12,
    backgroundColor: "#1e3a8a", alignItems: "center",
  },
  saveText: { fontSize: 15, color: "#fff", fontWeight: "700" },
});