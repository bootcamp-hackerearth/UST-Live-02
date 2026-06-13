import React from "react";
import { StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { colors, radius } from "../theme";

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
      buttonColor={color || colors.primary}
      textColor="#ffffff"
      style={styles.button}
      contentStyle={styles.content}
      labelStyle={styles.label}
      uppercase={false}
    >
      {title}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    marginBottom: 10,
    borderRadius: radius.md,
  },
  content: {
    minHeight: 50,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0,
  },
});
