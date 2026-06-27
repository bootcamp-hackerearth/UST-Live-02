import React from "react";

import { StyleSheet, Text, View } from "react-native";

interface Props {
  status: string;
}

const COLORS: Record<
  string,
  {
    background: string;
    color: string;
  }
> = {
  BOOKED: {
    background: "#DBEAFE",
    color: "#1D4ED8",
  },

  COMPLETED: {
    background: "#DCFCE7",
    color: "#15803D",
  },

  CANCELLED: {
    background: "#FEE2E2",
    color: "#DC2626",
  },

  IN_CONSULTATION: {
    background: "#FEF3C7",
    color: "#D97706",
  },

  NO_SHOW: {
    background: "#E2E8F0",
    color: "#475569",
  },
};

export default function StatusChip({ status }: Props) {
  const colors = COLORS[status] ?? COLORS.BOOKED;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.color,
          },
        ]}
      >
        {status.replaceAll("_", " ")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },

  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});
