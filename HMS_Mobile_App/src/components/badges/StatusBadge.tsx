import React from "react";

import { Text, View, StyleSheet } from "react-native";

import { Ionicons } from "@expo/vector-icons";

interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  const getConfig = () => {
    switch (status) {
      case "BOOKED":
        return {
          color: "#22C55E",
          bg: "#DCFCE7",
          icon: "checkmark-circle",
        };

      case "PENDING":
        return {
          color: "#F59E0B",
          bg: "#FEF3C7",
          icon: "time",
        };

      case "COMPLETED":
        return {
          color: "#2563EB",
          bg: "#DBEAFE",
          icon: "medical",
        };

      case "REJECTED":
        return {
          color: "#EF4444",
          bg: "#FEE2E2",
          icon: "close-circle",
        };

      case "CANCELLED":
        return {
          color: "#64748B",
          bg: "#E2E8F0",
          icon: "ban",
        };

      default:
        return {
          color: "#64748B",
          bg: "#E2E8F0",
          icon: "ellipse",
        };
    }
  };

  const config = getConfig();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
        },
      ]}
    >
      <Ionicons name={config.icon as any} size={14} color={config.color} />

      <Text
        style={[
          styles.text,
          {
            color: config.color,
          },
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 12,

    paddingVertical: 7,

    borderRadius: 999,

    alignSelf: "flex-start",
  },

  text: {
    fontWeight: "700",

    fontSize: 12,

    marginLeft: 5,

    letterSpacing: 0.3,
  },
});
