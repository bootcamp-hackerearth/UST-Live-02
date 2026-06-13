import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from "react-native";

interface AppInputProps
  extends TextInputProps {
  label: string;
  error?: string;
}

export default function AppInput({
  label,
  error,
  ...props
}: AppInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
      </Text>

      <TextInput
        style={[
          styles.input,
          error &&
            styles.inputError,
        ]}
        placeholderTextColor="#94A3B8"
        {...props}
      />

      {!!error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
  
}

const styles =
  StyleSheet.create({
    container: {
      marginBottom: 14,
    },

    label: {
      fontSize: 13,
      fontWeight: "600",
      color: "#334155",
      marginBottom: 8,
    },

    input: {
      height: 56,

      backgroundColor:
        "rgba(255,255,255,0.95)",

      borderRadius: 16,

      borderWidth: 1,

      borderColor: "#E2E8F0",

      paddingHorizontal: 16,

      color: "#0F172A",
    },

    inputError: {
      borderColor: "#EF4444",
    },

    error: {
      color: "#EF4444",

      fontSize: 12,

      marginTop: 6,

      marginLeft: 4,
    },
  });