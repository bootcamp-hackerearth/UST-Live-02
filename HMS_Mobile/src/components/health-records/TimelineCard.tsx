import React from "react";
import { StyleSheet, Text, View } from "react-native";
import GlassCard from "../cards/GlassCard";
import { Consultation } from "../../types/HealthRecord";

interface Props {
  consultation: Consultation;
}

function TimelineCard({ consultation }: Readonly<Props>) {
  const doctor = consultation.doctorEmployeeId;

  return (
    <GlassCard>
      <View style={styles.header}>
        <View>
          <Text style={styles.doctor}>{doctor?.name ?? "Doctor"}</Text>

          {!!doctor?.specialization && (
            <Text style={styles.subtitle}>{doctor.specialization}</Text>
          )}

          {!!doctor?.department && (
            <Text style={styles.department}>{doctor.department}</Text>
          )}
        </View>

        <Text style={styles.date}>
          {new Date(consultation.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {!!consultation.diagnosis && (
        <>
          <Text style={styles.label}>Diagnosis</Text>

          <Text style={styles.value}>{consultation.diagnosis}</Text>
        </>
      )}

      {!!consultation.doctorNotes && (
        <>
          <Text style={styles.label}>Doctor Notes</Text>

          <Text style={styles.value}>{consultation.doctorNotes}</Text>
        </>
      )}
    </GlassCard>
  );
}

export default React.memo(TimelineCard);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  doctor: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 2,
    color: "#64748B",
  },
  department: {
    color: "#94A3B8",
    marginTop: 2,
  },
  date: {
    color: "#64748B",
    fontSize: 13,
  },
  label: {
    marginTop: 14,
    marginBottom: 6,
    fontWeight: "700",
    color: "#2563EB",
    fontSize: 14,
  },
  value: {
    color: "#334155",
    lineHeight: 22,
    fontSize: 15,
  },
  vitals: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  vital: {
    marginRight: 14,
    marginBottom: 8,
    color: "#334155",
  },
});
