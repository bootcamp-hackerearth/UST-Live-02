import React from 'react';
import { COLORS } from '@/constants/theme';

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';

type AppInputProps = TextInputProps & {
  label: string;
  error?: string;
  rightElement?: React.ReactNode;
};

export default function AppInput({
  label,
  error,
  rightElement,
  ...props
}: AppInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        <TextInput
          style={styles.input}
          placeholderTextColor="#94A3B8"
          {...props}
        />

        {rightElement ? (
          <View style={styles.rightElement}>
            {rightElement}
          </View>
        ) : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 7,
  },

  inputWrapper: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 15,
    color: COLORS.textDark,
  },

  rightElement: {
    paddingHorizontal: 12,
  },

  inputError: {
    borderColor: COLORS.danger,
  },

  errorText: {
    marginTop: 5,
    fontSize: 12,
    color: COLORS.danger,
  },
});