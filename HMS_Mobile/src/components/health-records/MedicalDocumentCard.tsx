import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import GlassCard from "../cards/GlassCard";
import { MedicalDocument } from "../../types/HealthRecord";

interface Props {
  document: MedicalDocument;

  onView: (document: MedicalDocument) => void;

  onDownload: (document: MedicalDocument) => void;
}

function MedicalDocumentCard({ document, onView, onDownload }: Props) {
  return (
    <GlassCard>
      <Text style={styles.title}>{document.title}</Text>

      <Text style={styles.text}>{document.documentType}</Text>

      {!!document.hospitalName && (
        <Text style={styles.text}>{document.hospitalName}</Text>
      )}

      {!!document.recordDate && (
        <Text style={styles.text}>
          {new Date(document.recordDate).toLocaleDateString()}
        </Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => onView(document)}
        >
          <Text style={styles.buttonText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => onDownload(document)}
        >
          <Text style={styles.buttonText}>Download</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
}

export default React.memo(MedicalDocumentCard);

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
