import React from "react";
import { StyleSheet, View } from "react-native";
import { TextInput } from "react-native-paper";
import { colors, radius } from "../theme";

type InputFieldProps = Readonly<{
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  placeholder?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  maxLength?: number;
}>;

export default function InputField({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  placeholder,
  leftIcon,
  rightIcon,
  onRightIconPress,
  maxLength,
}: InputFieldProps) {
  return (
    <View style={styles.wrapper}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        placeholder={placeholder}
        maxLength={maxLength}
        left={leftIcon ? <TextInput.Icon icon={leftIcon} /> : undefined}
        right={
          rightIcon ? (
            <TextInput.Icon icon={rightIcon} onPress={onRightIconPress} />
          ) : undefined
        }
        mode="outlined"
        style={styles.input}
        contentStyle={styles.content}
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
        cursorColor={colors.primary}
        textColor={colors.text}
        theme={{
          roundness: radius.md,
          colors: {
            background: colors.surface,
            onSurfaceVariant: colors.textMuted,
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  input: {
    backgroundColor: colors.surface,
  },
  content: {
    fontSize: 15,
  },
});
