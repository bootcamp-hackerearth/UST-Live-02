import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = Readonly<{
  title: string;
  message?: string;
}>;

export default function EmptyState({ title, message }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>i</Text>
      </View>
      <Text style={styles.text}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 36,
    alignItems: "center",
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DBEAFE",
    marginBottom: 12,
  },
  iconText: {
    color: "#2563EB",
    fontSize: 20,
    fontWeight: "800",
  },
  text: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  message: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    textAlign: "center",
  },
});
