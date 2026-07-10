import React from "react";
import { StyleSheet, Text, View } from "react-native";

type OfflineBannerProps = {
  compact?: boolean;
};

export default function OfflineBanner({ compact = false }: OfflineBannerProps) {
  return (
    <View style={[styles.banner, compact && styles.compact]}>
      <Text style={styles.title}>Offline mode</Text>
      <Text style={styles.message}>
        Showing saved data when available. New changes will sync after
        reconnecting.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 6,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  compact: {
    marginTop: 0,
  },
  title: {
    color: "#92400E",
    fontSize: 14,
    fontWeight: "800",
  },
  message: {
    color: "#92400E",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
});
