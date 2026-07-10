import React from "react";
import { View, StyleSheet } from "react-native";

export default function AppointmentSkeleton() {
  return (
    <>
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.card} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 150,
    backgroundColor: "#E2E8F0",
    borderRadius: 28,
    marginBottom: 20,
  },
});
