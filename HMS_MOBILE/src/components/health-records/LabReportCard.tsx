import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import GlassCard from "../cards/GlassCard";
import { LabReport } from "../../types/HealthRecord";

interface Props {
  readonly report: LabReport;
  readonly onView: (report: LabReport) => void;
  readonly onDownload: (report: LabReport) => void;
}

function LabReportCard({ report, onView, onDownload }: Props) {
  return (
    <GlassCard>
      <Text style={styles.title}>{report.title}</Text>

      <Text style={styles.text}>{report.reportType}</Text>

      <Text style={styles.text}>
        {new Date(report.reportDate).toLocaleDateString()}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={() => onView(report)}>
          <Text style={styles.buttonText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => onDownload(report)}
        >
          <Text style={styles.buttonText}>Download</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
}

export default React.memo(LabReportCard);

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  text: {
    color: "#475569",
    marginBottom: 4,
  },
  actions: {
    flexDirection: "row",
    marginTop: 16,
  },
  button: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 12,
  },
  buttonText: {
    color: "#2563EB",
    fontWeight: "600",
  },
});
