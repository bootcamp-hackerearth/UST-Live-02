import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  readonly title: string;
  readonly value: number;
}

function StatCard({ title, value }: Props) {
  const getConfig = () => {
    switch (title) {
      case "Pending":
        return {
          icon: "time",
          color: "#F59E0B",
          bg: "#FEF3C7",
        };

      case "Booked":
        return {
          icon: "calendar",
          color: "#22C55E",
          bg: "#DCFCE7",
        };

      case "Completed":
        return {
          icon: "checkmark-circle",
          color: "#2563EB",
          bg: "#DBEAFE",
        };

      default:
        return {
          icon: "stats-chart",
          color: "#64748B",
          bg: "#E2E8F0",
        };
    }
  };

  const config = getConfig();

  return (
    <View style={styles.card}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: config.bg,
          },
        ]}
      >
        <Ionicons name={config.icon as any} size={20} color={config.color} />
      </View>

      <Text style={styles.value}>{value}</Text>

      <Text style={styles.title}>{title}</Text>
    </View>
  );
}
export default React.memo(StatCard);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 4,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  value: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
  },
  title: {
    marginTop: 6,
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});
