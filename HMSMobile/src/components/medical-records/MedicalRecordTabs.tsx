import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { MedicalRecordTab } from "../../types/MedicalRecord";

type Props = {
  activeTab: MedicalRecordTab;
  onChange: (tab: MedicalRecordTab) => void;
};

const tabs: { label: string; value: MedicalRecordTab }[] = [
  { label: "Prescriptions", value: "PRESCRIPTIONS" },
  { label: "Health Records", value: "HEALTH_RECORDS" },
  { label: "Lab Reports", value: "LAB_REPORTS" },
];

function MedicalRecordTabs({ activeTab, onChange }: Props) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;

        return (
          <TouchableOpacity
            key={tab.value}
            activeOpacity={0.82}
            style={[styles.tabButton, isActive && styles.activeTab]}
            onPress={() => onChange(tab.value)}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default React.memo(MedicalRecordTabs);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 6,
    borderRadius: 18,
    backgroundColor: "#EAF1FF",
  },

  tabButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  activeTab: {
    backgroundColor: "#2563EB",
  },

  tabText: {
    color: "#475569",
    fontWeight: "700",
    fontSize: 12,
    textAlign: "center",
  },

  activeTabText: {
    color: "#FFFFFF",
  },
});
