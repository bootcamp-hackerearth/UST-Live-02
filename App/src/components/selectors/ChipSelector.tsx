import React from "react";

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface Props {
  label: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

function ChipSelector({
  label,
  options,
  selectedValue,
  onSelect,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.chipContainer}>
        {options.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => onSelect(item)}
            style={[styles.chip, selectedValue === item && styles.activeChip]}
          >
            <Text
              style={[
                styles.chipText,
                selectedValue === item && styles.activeChipText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default React.memo(ChipSelector);

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 10,
  },

  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,

    borderRadius: 14,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E2E8F0",
  },

  activeChip: {
    backgroundColor: "#2563EB",

    borderColor: "#2563EB",
  },

  chipText: {
    color: "#334155",
    fontWeight: "500",
  },

  activeChipText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
