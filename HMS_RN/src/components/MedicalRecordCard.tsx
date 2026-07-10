/**
 * @file MedicalRecordCard.tsx
 * @overview An expandable card to display details of a medical record.
 * @description This component presents a summary of a medical record and allows the user to expand the card
 * to view more detailed information, such as complaints, symptoms, medications, and notes.
 * @connections
 * - `MedicalRecordsScreen.tsx` (fetches records) -> Passes `record` prop to `MEDICALRECORDCARD.TSX` for rendering.
 * - User clicks 'Show More'/'Show Less' -> `toggleExpand` callback -> Updates internal `expanded` state to show/hide content.
 */

import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MedicalRecord } from "../features/auth/types";

interface Props {
  record: MedicalRecord;
}

function MedicalRecordCard({ record }: Readonly<Props>) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const formatDate = (isoString: string) => {
    if (!isoString) return "N/A";
    const dateObj = new Date(isoString);
    return `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
  };

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.card}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <Text style={styles.recordCode}>{record.recordCode}</Text>

          <View
            style={[
              styles.statusBadge,
              record.status === "FINAL" ? styles.badgeFinal : styles.badgeDraft,
            ]}
          >
            <Text style={styles.statusText}>{record.status}</Text>
          </View>
        </View>

        <Text style={styles.appointmentId}>{record.appointmentId}</Text>
        {/* Doctor Info */}
        <Text style={styles.doctorName}>
          {record.doctorName
            ? `Dr.${record.doctorName}`
            : `Dr. ${record.doctorEmployeeId}`}
        </Text>
        <Text style={styles.specialization}>
          {record.doctorSpecialization || "General Medicine"}
        </Text>

        {/* Core Visit Info */}
        <View style={styles.infoBlock}>
          <Text style={styles.infoText}>
            Visit Date:
            <Text style={styles.bulletText}>
              {formatDate(record.visitDate)}
            </Text>
          </Text>
          <Text style={styles.infoText}>
            Diagnosis:{" "}
            <Text style={styles.bulletText}>
              {record.diagnosis || "Pending"}
            </Text>
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Expandable Content */}
        {expanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.infoText}>
              Complaint:
              <Text style={styles.bulletText}>{record.complaint || "N/A"}</Text>
            </Text>
            <Text style={styles.infoText}>
              Symptoms:
              <Text style={styles.bulletText}> {record.symptoms || "N/A"}</Text>
            </Text>

            {record.medications && record.medications.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>MEDICATIONS</Text>
                {record.medications.map((med, index) => (
                  <Text key={med._id || index} style={styles.bulletText}>
                    • {med.name} {med.dosage} — {med.frequency}{" "}
                    {med.duration ? `(${med.duration})` : ""}
                  </Text>
                ))}
              </>
            )}

            {!!record.notes && (
              <>
                <Text style={styles.sectionTitle}>NOTES</Text>
                <Text style={styles.notesText}>{record.notes}</Text>
              </>
            )}
          </View>
        )}

        {/* Toggle Button */}
        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={toggleExpand}
          activeOpacity={0.7}
        >
          <Text style={styles.toggleText}>
            {expanded ? "Show Less ▲" : "Show More ▼"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default React.memo(MedicalRecordCard);

const styles = StyleSheet.create({
  cardWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  recordCode: {
    color: "#6C4EDB",
    fontSize: 14,
    fontFamily: "ShareTech",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeFinal: {
    backgroundColor: "#10B981",
  },
  badgeDraft: {
    backgroundColor: "#F59E0B",
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Lexend",
    fontWeight: "bold",
  },
  doctorName: {
    color: "#1E1E3F",
    fontSize: 18,
    fontFamily: "Lexend",
    marginBottom: 2,
  },
  specialization: {
    color: "#6C4EDB",
    fontSize: 13,
    fontFamily: "Lexend",
    marginBottom: 12,
  },
  infoBlock: {
    marginBottom: 12,
  },
  infoText: {
    color: "#846ed0",
    fontSize: 14,
    fontFamily: "Sans",
    marginBottom: 4,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  expandedContent: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#846ed0",
    fontSize: 12,
    fontFamily: "Sans",
    marginTop: 12,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  bulletText: {
    color: "#4B5563",
    fontSize: 14,
    fontFamily: "Lexend",
    marginBottom: 4,
  },
  notesText: {
    color: "#4B5563",
    fontSize: 14,
    fontFamily: "Lexend",
    lineHeight: 20,
  },
  toggleBtn: {
    alignItems: "center",
    paddingTop: 8,
  },
  toggleText: {
    color: "#6C4EDB",
    fontSize: 13,
    fontFamily: "Lexend",
    fontWeight: "600",
  },
  appointmentId: {
    color: "#000000",
    fontSize: 14,
    fontFamily: "ShareTech",
  },
});
