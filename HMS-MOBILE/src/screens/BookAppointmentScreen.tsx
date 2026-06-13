import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";

import {
  getDoctorsApi,
  getAvailableSlotsApi,
  bookAppointmentApi,
} from "../api/appointment.api";

// ─── Types ────────────────────────────────────────────────────────────────────
type Doctor = {
  _id: string;
  name: string;
  specialization: string | null;
  department: string;
  consultationFee: number;
  availability?: {
    workingDays?: string[];
    isAvailable?: boolean;
  };
};

// ─── Constants ────────────────────────────────────────────────────────────────
const VISIT_MODES = ["In-Person", "Online"] as const;
const VISIT_REASONS = [
  "General Checkup",
  "Follow-up Visit",
  "New Symptoms",
  "Test / Lab Review",
  "Prescription Renewal",
  "Other",
];
const DAY_ABBR: Record<string, string> = {
  Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed",
  Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun",
};

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function BookAppointmentScreen({ navigation }: any) {
  // Doctor
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Date
  const [date, setDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  // Slots
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Form
  const [visitMode, setVisitMode] = useState<"In-Person" | "Online">("In-Person");
  const [reason, setReason] = useState("");
  const [showReasonModal, setShowReasonModal] = useState(false);

  // Submit
  const [submitting, setSubmitting] = useState(false);

  // ── Load doctors on mount ──────────────────────────────────────────────────
  useEffect(() => {
    fetchDoctors();
  }, []);

  // ── Fetch slots whenever doctor or date changes ────────────────────────────
  useEffect(() => {
    if (selectedDoctor) {
      fetchSlots();
    }
  }, [selectedDoctor, date]);

  // ── API calls ──────────────────────────────────────────────────────────────
  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const res = await getDoctorsApi();
      // GET /employees/doctors returns array directly (not wrapped in success/data)
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setDoctors(data);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to load doctors");
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchSlots = async () => {
    if (!selectedDoctor) return;
    try {
      setLoadingSlots(true);
      setSelectedSlot("");
      const dateStr = toApiDate(date); // "YYYY-MM-DD"
      const res = await getAvailableSlotsApi(selectedDoctor._id, dateStr);
      const data = res.data?.data ?? [];
      setSlots(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setSlots([]);
      Alert.alert("Error", err?.response?.data?.message || "Failed to load available slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBook = async () => {
  if (!selectedDoctor) return Alert.alert("Required", "Please select a doctor.");
  if (!selectedSlot)   return Alert.alert("Required", "Please select a time slot.");
  if (!reason)         return Alert.alert("Required", "Please select a reason for visit.");

  try {
    setSubmitting(true);
    const res = await bookAppointmentApi({
      doctorEmployeeId: selectedDoctor._id,
      appointmentDate:  toApiDate(date),
      timeSlot:         selectedSlot,
      visitMode:        visitMode === "In-Person" ? "OFFLINE" : "ONLINE",  // ✅ fix
      symptoms:         [reason], // reason goes into symptoms array
    });

    if (res.data?.success) {
      Alert.alert("Appointment Booked!", "Your appointment has been booked successfully.", [
        { text: "OK", onPress: () => navigation?.goBack() },
      ]);
    } else {
      Alert.alert("Error", res.data?.message || "Booking failed");
    }
  } catch (err: any) {
    Alert.alert("Error", err?.response?.data?.message || "Failed to book appointment");
  } finally {
    setSubmitting(false);
  }
};

  // ── Helpers ────────────────────────────────────────────────────────────────
  const toApiDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const toDisplayDate = (d: Date) =>
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  const isToday = (d: Date) => {
    const t = new Date();
    return d.getDate() === t.getDate() &&
           d.getMonth() === t.getMonth() &&
           d.getFullYear() === t.getFullYear();
  };

  const onDateChange = (_event: any, selected?: Date) => {
    if (Platform.OS === "android") setShowCalendar(false);
    if (selected) setDate(selected);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={{ width: 70 }}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Book Appointment</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">

        {/* ── Step 1: Doctor ────────────────────────────────────────────── */}
        <StepLabel n="1" label="Choose Doctor" />

        {loadingDoctors ? (
          <View style={s.loadingBox}>
            <ActivityIndicator color="#2563eb" />
            <Text style={s.loadingText}>Loading doctors…</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[s.selectBox, !!selectedDoctor && s.selectBoxActive]}
            onPress={() => setShowDoctorModal(true)}
            activeOpacity={0.8}
          >
            {selectedDoctor ? (
              <View style={s.doctorPreviewRow}>
                <Avatar name={selectedDoctor.name} active />
                <View style={{ flex: 1 }}>
                  <Text style={s.doctorPreviewName}>Dr. {selectedDoctor.name}</Text>
                  <Text style={s.doctorPreviewSpec}>
                    {selectedDoctor.specialization || selectedDoctor.department}
                  </Text>
                </View>
                {selectedDoctor.consultationFee > 0 && (
                  <Text style={s.feeTag}>₹{selectedDoctor.consultationFee}</Text>
                )}
              </View>
            ) : (
              <Text style={s.placeholder}>👨‍⚕️  Select a doctor…</Text>
            )}
            <Text style={s.chevron}>▾</Text>
          </TouchableOpacity>
        )}

        {/* Working days hint */}
        {selectedDoctor?.availability?.workingDays?.length ? (
          <View style={s.workingDaysRow}>
            <Text style={s.workingDaysLabel}>Available: </Text>
            {selectedDoctor.availability.workingDays.map((d) => (
              <View key={d} style={s.dayChip}>
                <Text style={s.dayChipText}>{DAY_ABBR[d] ?? d}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Step 2: Date ──────────────────────────────────────────────── */}
        <StepLabel n="2" label="Select Date" />

        <TouchableOpacity
          style={[s.selectBox, s.selectBoxActive]}
          onPress={() => setShowCalendar(true)}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 18, marginRight: 10 }}>📅</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.dateValue}>{toDisplayDate(date)}</Text>
            {isToday(date) && <Text style={s.todayPill}>Today</Text>}
          </View>
          <Text style={s.chevron}>▾</Text>
        </TouchableOpacity>

        {/* iOS — inline calendar stays visible until Done is tapped */}
        {showCalendar && Platform.OS === "ios" && (
          <>
            <TouchableOpacity style={s.doneBtn} onPress={() => setShowCalendar(false)}>
              <Text style={s.doneBtnText}>Done</Text>
            </TouchableOpacity>
            <DateTimePicker
              value={date}
              mode="date"
              display="inline"
              minimumDate={new Date()}
              onChange={onDateChange}
              accentColor="#2563eb"
              themeVariant="light"
              style={s.iosPicker}
            />
          </>
        )}

        {/* Android — modal-style calendar */}
        {showCalendar && Platform.OS === "android" && (
          <DateTimePicker
            value={date}
            mode="date"
            display="calendar"
            minimumDate={new Date()}
            onChange={onDateChange}
          />
        )}

        {/* ── Step 3: Time Slot ─────────────────────────────────────────── */}
        <StepLabel n="3" label="Pick a Time Slot" />

        {!selectedDoctor ? (
          <View style={s.hintBox}>
            <Text style={s.hintText}>🩺  Select a doctor first to see available slots</Text>
          </View>
        ) : loadingSlots ? (
          <View style={s.loadingBox}>
            <ActivityIndicator color="#2563eb" />
            <Text style={s.loadingText}>Checking availability…</Text>
          </View>
        ) : slots.length === 0 ? (
          <View style={s.hintBox}>
            <Text style={s.hintText}>😔  No slots available for this date. Try another day.</Text>
          </View>
        ) : (
          <View style={s.slotsGrid}>
            {slots.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[s.slotChip, selectedSlot === slot && s.slotChipActive]}
                onPress={() => setSelectedSlot(slot)}
                activeOpacity={0.75}
              >
                <Text style={[s.slotText, selectedSlot === slot && s.slotTextActive]}>
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Step 4: Visit Mode ────────────────────────────────────────── */}
        <StepLabel n="4" label="Visit Mode" />
        <View style={s.toggleRow}>
          {VISIT_MODES.map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[s.toggleChip, visitMode === mode && s.toggleChipActive]}
              onPress={() => setVisitMode(mode)}
              activeOpacity={0.8}
            >
              <Text style={[s.toggleText, visitMode === mode && s.toggleTextActive]}>
                {mode === "In-Person" ? "🏥  In-Person" : "💻  Online"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Step 5: Reason ────────────────────────────────────────────── */}
        <StepLabel n="5" label="Reason for Visit" />
        <TouchableOpacity
          style={[s.selectBox, !!reason && s.selectBoxActive]}
          onPress={() => setShowReasonModal(true)}
          activeOpacity={0.8}
        >
          <Text style={reason ? s.dateValue : s.placeholder}>
            {reason || "📋  Select a reason…"}
          </Text>
          <Text style={s.chevron}>▾</Text>
        </TouchableOpacity>

        {/* ── Booking Summary Card ──────────────────────────────────────── */}
        {selectedDoctor && selectedSlot && reason ? (
          <View style={s.summaryCard}>
            <Text style={s.summaryTitle}>📋  Booking Summary</Text>
            <SummaryRow label="Doctor"    value={`Dr. ${selectedDoctor.name}`} />
            <SummaryRow label="Date"      value={toDisplayDate(date)} />
            <SummaryRow label="Time"      value={selectedSlot} />
            <SummaryRow label="Mode"      value={visitMode} />
            <SummaryRow label="Reason"    value={reason} />
            {selectedDoctor.consultationFee > 0 && (
              <SummaryRow label="Fee" value={`₹${selectedDoctor.consultationFee}`} highlight />
            )}
          </View>
        ) : null}

        {/* ── Confirm Button ────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[s.bookBtn, submitting && s.bookBtnDisabled]}
          onPress={handleBook}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.bookBtnText}>Confirm Appointment</Text>
          )}
        </TouchableOpacity>

      </ScrollView>

      {/* ── Doctor Picker Bottom Sheet ─────────────────────────────────── */}
      <Modal visible={showDoctorModal} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Select Doctor</Text>
              <TouchableOpacity onPress={() => setShowDoctorModal(false)}>
                <Text style={s.sheetClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView bounces={false}>
              {doctors.map((doc) => {
                const active = selectedDoctor?._id === doc._id;
                return (
                  <TouchableOpacity
                    key={doc._id}
                    style={[s.doctorRow, active && s.doctorRowActive]}
                    onPress={() => { setSelectedDoctor(doc); setShowDoctorModal(false); }}
                    activeOpacity={0.75}
                  >
                    <Avatar name={doc.name} active={active} />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.doctorRowName, active && s.doctorRowNameActive]}>
                        Dr. {doc.name}
                      </Text>
                      <Text style={s.doctorRowSpec}>
                        {doc.specialization || doc.department}
                      </Text>
                      {doc.availability?.workingDays?.length ? (
                        <Text style={s.doctorRowDays}>
                          {doc.availability.workingDays
                            .map((d) => DAY_ABBR[d] ?? d)
                            .join(", ")}
                        </Text>
                      ) : null}
                    </View>
                    <View style={s.doctorRowRight}>
                      {doc.consultationFee > 0 && (
                        <Text style={s.feeTag}>₹{doc.consultationFee}</Text>
                      )}
                      {active && <Text style={s.check}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
              {doctors.length === 0 && (
                <View style={s.hintBox}>
                  <Text style={s.hintText}>No doctors found.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Reason Picker Bottom Sheet ─────────────────────────────────── */}
      <Modal visible={showReasonModal} animationType="slide" transparent>
        <View style={s.overlay}>
          <View style={[s.sheet, { maxHeight: "55%" }]}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Reason for Visit</Text>
              <TouchableOpacity onPress={() => setShowReasonModal(false)}>
                <Text style={s.sheetClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {VISIT_REASONS.map((r) => {
              const active = reason === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[s.reasonRow, active && s.reasonRowActive]}
                  onPress={() => { setReason(r); setShowReasonModal(false); }}
                  activeOpacity={0.75}
                >
                  <Text style={[s.reasonText, active && s.reasonTextActive]}>{r}</Text>
                  {active && <Text style={s.check}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ─── Small reusable components ────────────────────────────────────────────────
function StepLabel({ n, label }: { n: string; label: string }) {
  return (
    <View style={s.stepRow}>
      <View style={s.stepBadge}><Text style={s.stepNum}>{n}</Text></View>
      <Text style={s.stepLabel}>{label}</Text>
    </View>
  );
}

function Avatar({ name, active }: { name: string; active: boolean }) {
  return (
    <View style={[s.avatar, active && s.avatarActive]}>
      <Text style={[s.avatarText, active && s.avatarTextActive]}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={s.summaryRow}>
      <Text style={s.summaryLabel}>{label}</Text>
      <Text style={[s.summaryValue, highlight && s.summaryValueHighlight]}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const BLUE = "#2563eb";
const BLUE_LIGHT = "#eff6ff";

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f3f4f6" },

  // Header
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: BLUE, paddingHorizontal: 16, paddingVertical: 16,
  },
  backText:    { color: "#fff", fontSize: 16, fontWeight: "bold" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },

  body: { padding: 18, paddingBottom: 56 },

  // Step label
  stepRow:   { flexDirection: "row", alignItems: "center", marginTop: 26, marginBottom: 10 },
  stepBadge: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: BLUE,
    alignItems: "center", justifyContent: "center", marginRight: 8,
  },
  stepNum:   { color: "#fff", fontWeight: "bold", fontSize: 13 },
  stepLabel: { fontSize: 15, fontWeight: "700", color: "#111827" },

  // Select box
  selectBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 12, borderWidth: 1.5,
    borderColor: "#e5e7eb", paddingHorizontal: 14, paddingVertical: 14,
    elevation: 1, shadowColor: "#000", shadowOpacity: 0.04,
    shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  selectBoxActive: { borderColor: BLUE },
  placeholder:     { flex: 1, color: "#9ca3af", fontSize: 14 },
  chevron:         { color: "#6b7280", fontSize: 16, marginLeft: 8 },

  // Doctor preview inside select box
  doctorPreviewRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  doctorPreviewName: { fontWeight: "700", color: "#111827", fontSize: 14 },
  doctorPreviewSpec: { color: "#6b7280", fontSize: 12, marginTop: 1 },

  // Avatar
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: BLUE_LIGHT, alignItems: "center",
    justifyContent: "center", marginRight: 12,
  },
  avatarActive:     { backgroundColor: BLUE },
  avatarText:       { color: BLUE, fontWeight: "bold", fontSize: 16 },
  avatarTextActive: { color: "#fff" },

  // Fee tag
  feeTag: {
    fontSize: 12, fontWeight: "700", color: BLUE,
    backgroundColor: BLUE_LIGHT, paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 8, marginLeft: 8,
  },

  // Working days
  workingDaysRow: { flexDirection: "row", alignItems: "center", marginTop: 8, flexWrap: "wrap" },
  workingDaysLabel: { fontSize: 12, color: "#6b7280", marginRight: 4 },
  dayChip: {
    backgroundColor: "#dbeafe", borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2, marginRight: 4, marginTop: 2,
  },
  dayChipText: { fontSize: 11, color: BLUE, fontWeight: "600" },

  // Date
  dateValue: { fontSize: 14, fontWeight: "600", color: "#111827" },
  todayPill: { fontSize: 11, color: BLUE, fontWeight: "600", marginTop: 2 },
  iosPicker: { backgroundColor: "#fff", borderRadius: 12 },
  doneBtn: {
    alignSelf: "flex-end", marginBottom: 6,
    paddingHorizontal: 16, paddingVertical: 6,
    backgroundColor: BLUE, borderRadius: 8,
  },
  doneBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  // Slots
  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  slotChip: {
    paddingHorizontal: 16, paddingVertical: 11,
    borderRadius: 10, borderWidth: 1.5, borderColor: "#d1d5db", backgroundColor: "#fff",
  },
  slotChipActive: { backgroundColor: BLUE, borderColor: BLUE },
  slotText:       { color: "#374151", fontSize: 13, fontWeight: "600" },
  slotTextActive: { color: "#fff" },

  // Visit mode
  toggleRow: { flexDirection: "row", gap: 12 },
  toggleChip: {
    flex: 1, paddingVertical: 13, borderRadius: 10,
    borderWidth: 1.5, borderColor: "#d1d5db", alignItems: "center", backgroundColor: "#fff",
  },
  toggleChipActive: { backgroundColor: BLUE_LIGHT, borderColor: BLUE },
  toggleText:       { color: "#6b7280", fontWeight: "600", fontSize: 13 },
  toggleTextActive: { color: BLUE },

  // Hint / loading
  hintBox: {
    backgroundColor: BLUE_LIGHT, borderRadius: 10, padding: 14, alignItems: "center",
  },
  hintText:    { color: "#3b82f6", fontSize: 13, textAlign: "center" },
  loadingBox:  { flexDirection: "row", alignItems: "center", padding: 14 },
  loadingText: { color: "#6b7280", marginLeft: 10, fontSize: 13 },

  // Summary card
  summaryCard: {
    marginTop: 24, backgroundColor: "#fff", borderRadius: 14,
    padding: 16, borderLeftWidth: 4, borderLeftColor: BLUE,
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.06,
    shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  summaryTitle:          { fontWeight: "700", color: "#111827", fontSize: 14, marginBottom: 12 },
  summaryRow:            { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  summaryLabel:          { fontSize: 13, color: "#6b7280" },
  summaryValue:          { fontSize: 13, color: "#111827", fontWeight: "600", maxWidth: "60%", textAlign: "right" },
  summaryValueHighlight: { color: BLUE },

  // Book button
  bookBtn: {
    marginTop: 28, backgroundColor: BLUE, borderRadius: 14,
    paddingVertical: 16, alignItems: "center",
    elevation: 3, shadowColor: BLUE, shadowOpacity: 0.35,
    shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  bookBtnDisabled: { opacity: 0.6 },
  bookBtnText:     { color: "#fff", fontSize: 16, fontWeight: "bold", letterSpacing: 0.4 },

  // Bottom sheet modal
  overlay:     { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff", borderTopLeftRadius: 22, borderTopRightRadius: 22,
    maxHeight: "78%", paddingBottom: 30,
  },
  sheetHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 18,
    borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
  },
  sheetTitle: { fontSize: 17, fontWeight: "bold", color: "#111827" },
  sheetClose: { fontSize: 18, color: "#6b7280", fontWeight: "bold" },

  // Doctor rows
  doctorRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#f9fafb",
  },
  doctorRowActive:     { backgroundColor: BLUE_LIGHT },
  doctorRowName:       { fontSize: 15, fontWeight: "600", color: "#111827" },
  doctorRowNameActive: { color: BLUE },
  doctorRowSpec:       { fontSize: 12, color: "#6b7280", marginTop: 2 },
  doctorRowDays:       { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  doctorRowRight:      { alignItems: "flex-end", gap: 4 },
  check:               { color: BLUE, fontWeight: "bold", fontSize: 18 },

  // Reason rows
  reasonRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
  },
  reasonRowActive: { backgroundColor: BLUE_LIGHT },
  reasonText:      { flex: 1, fontSize: 15, color: "#374151" },
  reasonTextActive:{ color: BLUE, fontWeight: "600" },
});