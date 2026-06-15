import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getMyPatientAppointmentsApi, updatePatientAppointmentApi } from "../api/patient.api";
import ScreenHeader from "../components/ScreenHeader";
import { colors, radius, shadow, spacing } from "../theme";
import {
  isPastOrCurrentTimeToday,
  onlyTimeCharacters,
  TIME_24_HOUR_REGEX,
} from "../utils/validation";

export default function AppointmentsScreen({ navigation }: any) {
  // ── List state ────
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ── Edit modal state ───────────────────────────────────────────────────────
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [editDate, setEditDate] = useState(new Date());
  const [editSlot, setEditSlot] = useState("");
  const [showEditCalendar, setShowEditCalendar] = useState(false);
  const [updating, setUpdating] = useState(false);

  // ── Load appointments ──────────────────────────────────────────────────────
  const loadAppointments = async () => {
    try {
      setLoading(true);
      const res = await getMyPatientAppointmentsApi();
      if (res.data.success) {
        setAppointments(res.data.data);
      } else {
        Alert.alert("Error", res.data.message || "Failed to load appointments");
      }
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // ── Edit helpers ──
  const openEditModal = (appt: any) => {
    setSelectedAppt(appt);
    setEditDate(new Date(appt.appointmentDate));
    setEditSlot(appt.timeSlot ?? "");
    setEditModalVisible(true);
  };

  const toApiDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const handleUpdate = async () => {
    if (!selectedAppt) return;
    const nextTimeSlot = editSlot.trim();

    if (!nextTimeSlot) {
      Alert.alert("Required", "Please enter a time slot.");
      return;
    }

    if (!TIME_24_HOUR_REGEX.test(nextTimeSlot)) {
      Alert.alert("Invalid time", "Please enter time in 24-hour format, for example 09:00 or 14:30.");
      return;
    }

    if (isPastOrCurrentTimeToday(editDate, nextTimeSlot)) {
      Alert.alert("Invalid time", "For today's appointment, please select a future time slot.");
      return;
    }

    try {
      setUpdating(true);
      const res = await updatePatientAppointmentApi(selectedAppt._id, {
        appointmentDate: toApiDate(editDate),
        timeSlot: nextTimeSlot,
      });
      if (res.data.success) {
        Alert.alert("Success", "Appointment updated successfully.");
        setEditModalVisible(false);
        loadAppointments();
      } else {
        Alert.alert("Error", res.data.message || "Update failed");
      }
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to update appointment");
    } finally {
      setUpdating(false);
    }
  };

  // ── Status helpers 
  const statusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":  return "#10b981";
      case "PENDING":   return "#f59e0b";
      case "REJECTED":  return "#ef4444";
      case "BOOKED":    return "#2563eb";
      default:          return "#6b7280";
    }
  };

  // ── Render ────────
  return (
    <SafeAreaView style={styles.safeArea}>

      <ScreenHeader title="My Appointments" onBack={() => navigation.goBack()} />

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.list}
          nestedScrollEnabled
        >
          {appointments.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>No appointments</Text>
              <Text style={styles.emptyText}>Your booked visits will appear here.</Text>
            </View>
          ) : (
            appointments.map((appt) => (
              <View key={appt._id} style={styles.card}>

                {/* Top row: patient name + status badge */}
                <View style={styles.cardHeader}>
                  <Text style={styles.patientName}>
                    {formatPatientName(appt.patientId)}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: statusColor(appt.approvalStatus) }]}>
                    <Text style={styles.badgeText}>{appt.approvalStatus}</Text>
                  </View>
                </View>

                <Text style={styles.apptId}>ID: {appt.appointmentId}</Text>
                <View style={styles.divider} />

                <InfoRow icon="Dr" label="Doctor" value={appt.doctorEmployeeId?.name} />
                <InfoRow
                  icon="Dt"
                  label="Date"
                  value={new Date(appt.appointmentDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                />
                <InfoRow icon="Tm" label="Time"  value={appt.timeSlot} />
                <InfoRow icon="Ty" label="Type"  value={appt.appointmentType} />
                {appt.notes ? (
                  <InfoRow icon="Nt" label="Notes" value={appt.notes} />
                ) : null}

                {/* Edit button — only for PENDING appointments */}
                {appt.approvalStatus === "PENDING" && (
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => openEditModal(appt)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.editBtnText}>Edit Appointment</Text>
                  </TouchableOpacity>
                )}

              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* ── Edit Modal ───────────────────────────────────────────────────── */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.sheet}>

            {/* Modal header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Edit Appointment</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.sheetClose}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.sheetScroll}
              contentContainerStyle={styles.sheetScrollContent}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >

              {/* Current info (read-only) */}
              {selectedAppt && (
                <View style={styles.currentInfoBox}>
                  <Text style={styles.currentInfoTitle}>Current Appointment</Text>
                  <Text style={styles.currentInfoText}>
                    {selectedAppt.doctorEmployeeId?.name ?? "-"}
                  </Text>
                  <Text style={styles.currentInfoText}>
                    {new Date(selectedAppt.appointmentDate).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                    {"   "}{selectedAppt.timeSlot ?? "-"}
                  </Text>
                </View>
              )}

              {/* New Date */}
              <Text style={styles.editLabel}>New Date</Text>
              <TouchableOpacity
                style={styles.editSelectBox}
                onPress={() => setShowEditCalendar(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.editSelectText}>
                  {editDate.toLocaleDateString("en-IN", {
                    day: "2-digit", month: "long", year: "numeric",
                  })}
                </Text>
                <Text style={styles.chevron}>Select</Text>
              </TouchableOpacity>

              {showEditCalendar && Platform.OS === "ios" && (
                <>
                  <TouchableOpacity
                    style={styles.doneBtn}
                    onPress={() => setShowEditCalendar(false)}
                  >
                    <Text style={styles.doneBtnText}>Done</Text>
                  </TouchableOpacity>
                  <DateTimePicker
                    value={editDate}
                    mode="date"
                    display="inline"
                    minimumDate={new Date()}
                    accentColor="#2563eb"
                    themeVariant="light"
                    onValueChange={(_event, selected) => {
                      setEditDate(selected);
                    }}
                  />
                </>
              )}

              {showEditCalendar && Platform.OS === "android" && (
                <DateTimePicker
                  value={editDate}
                  mode="date"
                  display="calendar"
                  minimumDate={new Date()}
                  onValueChange={(_event, selected) => {
                    setShowEditCalendar(false);
                    setEditDate(selected);
                  }}
                  onDismiss={() => setShowEditCalendar(false)}
                />
              )}

              {/* New Time Slot */}
              <Text style={styles.editLabel}>New Time Slot</Text>
              <TextInput
                style={styles.editInput}
                value={editSlot}
                onChangeText={(value) => setEditSlot(onlyTimeCharacters(value))}
                placeholder="e.g. 10:00"
                placeholderTextColor="#9ca3af"
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
              <Text style={styles.editHint}>
                Enter time in 24-hour format exactly as shown, for example 09:00.
              </Text>

              {/* Save button */}
              <TouchableOpacity
                style={[styles.saveBtn, updating && styles.saveBtnDisabled]}
                onPress={handleUpdate}
                disabled={updating}
                activeOpacity={0.85}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>

              <View style={{ height: 20 }} />
            </ScrollView>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const formatPatientName = (patient?: any) => {
  const name = [patient?.firstName, patient?.lastName].filter(Boolean).join(" ");
  return name || "Patient";
};

// ─── InfoRow ─────────
type AppointmentInfoRowProps = Readonly<{
  icon: string;
  label: string;
  value?: string;
}>;

function InfoRow({ icon, label, value }: AppointmentInfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value ?? "—"}</Text>
    </View>
  );
}

// ─── Styles 
const BLUE       = colors.primary;
const BLUE_LIGHT = colors.primaryLight;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },

  // Header
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: BLUE, paddingHorizontal: 16, paddingVertical: 16,
  },
  backText:    { color: "#fff", fontSize: 16, fontWeight: "bold", width: 60 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },

  // List
  list: { flexGrow: 1, padding: spacing.lg, paddingBottom: spacing.xl },

  // Empty state
  empty: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: spacing.xl,
    padding: spacing.xl,
  },
  emptyIcon: { color: colors.text, fontSize: 18, fontWeight: "900", marginBottom: 8 },
  emptyText: { color: colors.textMuted, fontSize: 14, textAlign: "center" },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadow,
  },
  cardHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 4,
  },
  patientName: { fontSize: 16, fontWeight: "800", color: colors.text, flex: 1 },
  badge:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:   { color: "#fff", fontSize: 12, fontWeight: "bold", textTransform: "capitalize" },
  apptId:      { fontSize: 12, color: colors.textMuted, marginBottom: 10 },
  divider:     { height: 1, backgroundColor: colors.border, marginBottom: 10 },

  // InfoRow
  infoRow:   { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  infoIcon:  {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
    marginRight: 8,
    width: 20,
  },
  infoLabel: { fontSize: 13, color: colors.textMuted, fontWeight: "700", marginRight: 4, width: 54 },
  infoValue: { fontSize: 13, color: colors.text, flex: 1, fontWeight: "600" },

  // Edit button on card
  editBtn: {
    alignItems: "center",
    borderColor: colors.primary,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.md,
    paddingVertical: 11,
  },
  editBtnText: { color: BLUE, fontWeight: "700", fontSize: 13 },

  // Modal overlay + sheet
  overlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.45)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: "88%",
    paddingBottom: 10,
  },
  sheetHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 18,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  sheetScroll: {
    flex: 1,
  },
  sheetScrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  sheetTitle: { fontSize: 17, fontWeight: "800", color: colors.text },
  sheetClose: { fontSize: 13, color: colors.primary, fontWeight: "800" },

  // Current info box inside modal
  currentInfoBox: {
    backgroundColor: BLUE_LIGHT, borderRadius: radius.md, padding: 14, marginBottom: 8,
  },
  currentInfoTitle: { fontSize: 12, fontWeight: "700", color: BLUE, marginBottom: 6 },
  currentInfoText:  { fontSize: 13, color: "#374151", marginBottom: 3 },

  // Edit form fields
  editLabel: {
    fontSize: 13, fontWeight: "600", color: "#374151",
    marginBottom: 6, marginTop: 16,
  },
  editSelectBox: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderWidth: 1.5, borderColor: "#d1d5db", borderRadius: 10,
    padding: 13, backgroundColor: "#f9fafb",
  },
  editSelectText: { fontSize: 14, color: "#111827" },
  chevron:        { color: "#6b7280", fontSize: 16 },
  doneBtn: {
    alignSelf: "flex-end", marginBottom: 6,
    paddingHorizontal: 16, paddingVertical: 6,
    backgroundColor: BLUE, borderRadius: 8,
  },
  doneBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  editInput: {
    borderWidth: 1.5, borderColor: "#d1d5db", borderRadius: 10,
    padding: 13, fontSize: 14, color: "#111827", backgroundColor: "#f9fafb",
  },
  editHint: { fontSize: 11, color: "#9ca3af", marginTop: 4 },

  // Save button
  saveBtn: {
    marginTop: 24, backgroundColor: BLUE, borderRadius: 12,
    paddingVertical: 15, alignItems: "center",
    elevation: 3, shadowColor: BLUE, shadowOpacity: 0.3,
    shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText:     { color: "#fff", fontWeight: "bold", fontSize: 15 },
});
