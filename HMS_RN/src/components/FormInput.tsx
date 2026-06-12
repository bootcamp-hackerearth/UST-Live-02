import React from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { Controller, Control } from "react-hook-form";

interface FormInputProps extends TextInputProps {
  name: string;
  control: Control<any>;
  error?: { message?: string };
  isDisabled?: boolean;
}

export default function FormInput({
  name,
  control,
  error,
  isDisabled,
  style,
  ...rest
}: Readonly<FormInputProps>) {
  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[
              styles.input,
              error && styles.inputError,
              isDisabled && styles.disabledInput,
              style,
            ]}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value?.toString() ?? ""}
            editable={!isDisabled}
            {...rest}
          />
        )}
      />
      {!!(error?.message) && <Text style={styles.errorText}>{error.message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: "#1E1E3F",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  inputError: { borderColor: "#ef4444", borderWidth: 1 },
  disabledInput: { backgroundColor: "#F3F4F6", color: "#9CA3AF" },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginBottom: 12,
    marginTop: -10,
    marginLeft: 8,
    fontFamily: "Lexend",
  },
});
