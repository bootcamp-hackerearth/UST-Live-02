import React from "react";
import { StyleSheet, View } from "react-native";

export default function CardSkeleton() {
  return <View style={styles.card} />;
}

const styles = StyleSheet.create({
  card: {
    height: 140,
    borderRadius: 24,
    backgroundColor: "#E2E8F0",
    marginBottom: 16,
  },
});
