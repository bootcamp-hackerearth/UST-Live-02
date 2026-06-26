import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import GlassCard from "../cards/GlassCard";
import { PrescriptionRecord } from "../../types/MedicalRecord";
import { formatDate } from "../../utils/format";

type Props = {
  item: PrescriptionRecord;
  onPress: (item: PrescriptionRecord) => void;
};

function PrescriptionRecordCard({ item, onPress }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.86} onPress={() => onPress(item)}>
      <GlassCard>
        <Text style={styles.title}>
          Dr. {item.doctorEmployeeId?.name || "Not available"}
        </Text>

        <Text style={styles.meta}>
          {item.doctorEmployeeId?.department || "Department not available"}
        </Text>

        {!!item.diagnosis && <Text style={styles.diagnosis}>{item.diagnosis}</Text>}

        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>

        <Text style={styles.openHint}>View full prescription</Text>
      </GlassCard>
    </TouchableOpacity>
  );
}

export default React.memo(PrescriptionRecordCard);

const styles = StyleSheet.create({
  title: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
  },

  meta: {
    color: "#2563EB",
    fontWeight: "700",
    marginTop: 6,
  },

  diagnosis: {
    color: "#334155",
    marginTop: 10,
    lineHeight: 20,
  },

  date: {
    color: "#64748B",
    marginTop: 8,
  },

  openHint: {
    color: "#2563EB",
    fontWeight: "800",
    marginTop: 18,
  },
});
