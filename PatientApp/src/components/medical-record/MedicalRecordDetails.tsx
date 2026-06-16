import { StyleSheet, Text, View } from "react-native";
import type { MedicalRecord } from "@/services/types";
import { formatApptDate } from "@/utils/format";

const TEAL = "#2e9466";

type Props = Readonly<{ record: MedicalRecord }>;

// Read-only presentation of a finalized medical record
export default function MedicalRecordDetails({ record }: Props) {
  return (
    <View>
      <View style={styles.headerCard}>
        <Text style={styles.recordId}>{record.medicalRecordId}</Text>
        <Text style={styles.doctor}>Dr. {record.doctorName}</Text>
        <Text style={styles.meta}>
          Appointment {record.appointmentId}
          {record.created_at ? ` · ${formatApptDate(record.created_at)}` : ""}
        </Text>
      </View>

      <Section title="Symptoms">
        <Text style={styles.bodyText}>{record.symptoms}</Text>
      </Section>

      <Section title="Diagnosis">
        <Text style={styles.bodyText}>{record.diagnosis}</Text>
      </Section>

      <Section title="Prescription">
        {record.prescriptionItems?.length ? (
          record.prescriptionItems.map((item, i) => (
            <View key={`${item.name}-${i}`} style={styles.rxRow}>
              <Text style={styles.rxName}>{item.name}</Text>
              <Text style={styles.rxMeta}>
                {item.dosage} · {item.duration}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.muted}>No prescription items.</Text>
        )}
      </Section>

      {record.notes ? (
        <Section title="Notes">
          <Text style={styles.bodyText}>{record.notes}</Text>
        </Section>
      ) : null}
    </View>
  );
}

function Section({
  title,
  children,
}: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: "#f0faf4",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  recordId: { fontSize: 13, fontWeight: "600", color: TEAL, marginBottom: 4 },
  doctor: { fontSize: 18, fontWeight: "700", color: "#1f2937" },
  meta: { fontSize: 13, color: "#6b7280", marginTop: 2 },

  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  bodyText: { fontSize: 15, color: "#1f2937", lineHeight: 21 },

  rxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f3f4f6",
  },
  rxName: { fontSize: 15, color: "#1f2937", fontWeight: "600", flex: 1 },
  rxMeta: { fontSize: 13, color: "#6b7280" },

  muted: { fontSize: 14, color: "#9ca3af" },
});
