import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ProfileFieldProps {
  label: string;
  value: string | undefined | null;
  hideBorder?: boolean;
}

function ProfileField({
  label,
  value,
  hideBorder = false,
}: Readonly<ProfileFieldProps>) {
  return (
    <View style={[styles.container, !hideBorder && styles.borderBottom]}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <Text style={styles.value}>{value || "N/A"}</Text>
    </View>
  );
}

export default React.memo(ProfileField);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  label: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Lexend",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: "#1E1E3F",
    fontFamily: "Lexend",
  },
});
