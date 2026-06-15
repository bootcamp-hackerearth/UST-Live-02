import React from "react";

import { TouchableOpacity, Text, StyleSheet, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

interface Props {
  readonly  title: string;
   readonly onPress: () => void;
}

export default function QuickActionCard({ title, onPress }: Props) {
  const getIcon = () => {
    switch (title) {
      case "Book":
        return "add-circle";

      case "Appointments":
        return "calendar";

      case "Profile":
        return "person";

      case "Records":
        return "document-text";

      default:
        return "grid";
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name={getIcon() as any} size={24} color="#2563EB" />
      </View>

      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,

    height: 120,

    backgroundColor: "rgba(255,255,255,0.95)",

    borderRadius: 24,

    justifyContent: "center",

    alignItems: "center",

    margin: 6,

    borderWidth: 1,

    borderColor: "#E2E8F0",

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
    width: 52,

    height: 52,

    borderRadius: 26,

    backgroundColor: "#DBEAFE",

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 12,
  },

  title: {
    fontWeight: "700",

    fontSize: 14,

    color: "#0F172A",
  },
});
