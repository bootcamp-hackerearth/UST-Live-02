import React from "react";

import { View, StyleSheet } from "react-native";

interface Props {
   readonly children: React.ReactNode;
}

export default function GlassCard({ children }: Props) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.88)",

    borderRadius: 28,

    padding: 22,

    marginBottom: 18,

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.95)",

    shadowColor: "#2563EB",

    shadowOpacity: 0.08,

    shadowRadius: 24,

    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 6,
  },
});
