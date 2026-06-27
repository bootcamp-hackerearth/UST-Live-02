import React from "react";

import { View, StyleSheet } from "react-native";

export default function DashboardSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.hero} />

      <View style={styles.card} />

      <View style={styles.row}>
        <View style={styles.quickCard} />

        <View style={styles.quickCard} />
      </View>

      <View style={styles.row}>
        <View style={styles.quickCard} />

        <View style={styles.quickCard} />
      </View>

      <View style={styles.card} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  hero: {
    height: 140,
    borderRadius: 30,
    backgroundColor: "#E2E8F0",
    marginBottom: 20,
  },

  card: {
    height: 140,
    borderRadius: 28,
    backgroundColor: "#E2E8F0",
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  quickCard: {
    width: "48%",
    height: 100,
    borderRadius: 24,
    backgroundColor: "#E2E8F0",
  },
});
