import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type HealthRecordTab =
  | "TIMELINE"
  | "PRESCRIPTIONS"
  | "REPORTS"
  | "DOCUMENTS";

interface Props {
  readonly activeTab: HealthRecordTab;
  readonly onChange: (tab: HealthRecordTab) => void;
}

export default function HealthRecordTabs({ activeTab, onChange }: Props) {
  const tabs: HealthRecordTab[] = [
    "TIMELINE",
    "PRESCRIPTIONS",
    "REPORTS",
    "DOCUMENTS",
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => onChange(tab)}
        >
          <Text style={[styles.text, activeTab === tab && styles.activeText]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    marginRight: 8,
    marginBottom: 8,
  },
  activeTab: {
    backgroundColor: "#2563EB",
  },
  text: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 12,
  },
  activeText: {
    color: "#FFF",
  },
});
