import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface SelectablePillProps {
  isSelected: boolean;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

function SelectablePill({
  isSelected,
  title,
  subtitle,
  onPress,
}: Readonly<SelectablePillProps>) {
  return (
    <TouchableOpacity
      style={[styles.pill, isSelected && styles.pillSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
        {title}
      </Text>
      {!!subtitle && (
        <Text
          style={[styles.pillSubText, isSelected && styles.pillSubTextSelected]}
        >
          {subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default React.memo(SelectablePill);

const styles = StyleSheet.create({
  pill: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  pillSelected: {
    backgroundColor: "#4B1D76",
    borderColor: "#4B1D76",
    shadowColor: "#4B1D76",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pillText: { fontSize: 14, color: "#4B5563", fontWeight: "600" },
  pillTextSelected: { color: "#FFFFFF" },
  pillSubText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
    fontFamily: "Lexend",
  },
  pillSubTextSelected: { color: "#D1D5DB" },
});
