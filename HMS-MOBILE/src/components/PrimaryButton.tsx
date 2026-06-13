import React from "react";
import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  color?: string;
}

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  color,
}: PrimaryButtonProps) {
  return (
    <Button
      mode="contained"
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      style={[styles.button, color ? { backgroundColor: color } : undefined]}
      contentStyle={styles.content}
      labelStyle={styles.label}
    >
      {title}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: "#2563eb",
  },
  content: {
    paddingVertical: 6,
  },
  label: {
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
});
