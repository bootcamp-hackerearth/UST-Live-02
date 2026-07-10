import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import GlassCard from "../cards/GlassCard";
import { PrescriptionGroup } from "../../types/HealthRecord";

type Props = Readonly<{
  item: PrescriptionGroup;

  onView: (item: PrescriptionGroup) => void;

  onDownload: (item: PrescriptionGroup) => void;
}>;

function PrescriptionCard({ item, onView, onDownload }: Props) {
  return (
    <GlassCard>
      <Text style={styles.title}>
        {new Date(item.date).toLocaleDateString()}
      </Text>

      {!!item.doctor && <Text style={styles.title}>Dr. {item.doctor}</Text>}

      <Text style={styles.count}>{item.prescriptions.length} Medicines</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={() => onView(item)}>
          <Text style={styles.buttonText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => onDownload(item)}
        >
          <Text style={styles.buttonText}>Download</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
}

export default React.memo(PrescriptionCard);

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },
  text: {
    color: "#475569",
    marginBottom: 4,
  },
  count: {
    marginTop: 12,
    color: "#2563EB",
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    marginTop: 18,
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
