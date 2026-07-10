import React from "react";
import { View, StyleSheet } from "react-native";

interface Props {
  readonly children: React.ReactNode;
}

function GlassCard({ children }: Props) {
  return <View style={styles.card}>{children}</View>;
}

export default React.memo(GlassCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(37,99,235,0.06)",
    shadowColor: "#2563EB",
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 6,
  },
});
