/**
 * @file SearchBar.tsx
 * @overview A reusable search input component.
 * @description This component provides a styled text input with a search icon and a clear button
 * that appears when there is text. It is used across the application for various search functionalities.
 * - SEARCHBAR.TSX -> AppointmentForm.tsx
 * @connections
 * - Parent Component (e.g., `HomeScreen`, `MedicalRecordFilter`) -> Manages the search state (`value`).
 * - Parent Component -> Renders `SEARCHBAR.TSX`, passing `value` and `onChangeText` callback.
 * - User types in `TextInput` -> `onChangeText` is called -> Parent component updates its state.
 */

import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  NativeSyntheticEvent,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmitEditing?: (e: NativeSyntheticEvent<{ text: string }>) => void;
}

function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
  onSubmitEditing,
}: Readonly<SearchBarProps>) {
  return (
    <View style={styles.container}>
      <Feather name="search" size={20} color="#9CA3AF" style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
        autoCorrect={false}
      />

      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText("")}
          style={styles.clearBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="x-circle" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default React.memo(SearchBar);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: "#1E1E3F", fontFamily: "Lexend" },
  clearBtn: {
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
