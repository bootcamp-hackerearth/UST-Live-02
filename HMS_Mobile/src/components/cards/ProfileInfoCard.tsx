import React from "react";

import { View, Text, StyleSheet } from "react-native";

interface Props {
  label: string;
  value: string;
}

export default function ProfileInfoCard({ label, value }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>

      <Text style={styles.value}>{value || "-"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    padding: 18,

    marginBottom: 12,
  },

  label: {
    color: "#64748B",
    fontSize: 13,
    marginBottom: 6,
  },

  value: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "600",
  },
});
