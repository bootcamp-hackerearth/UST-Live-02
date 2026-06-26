import React from "react";

import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

import { Ionicons } from "@expo/vector-icons";

interface Props {
  slots: string[];
  selectedSlot: string;
  onSelect: (slot: string) => void;
}

function TimeSlotSelector({
  slots,
  selectedSlot,
  onSelect,
}: Props) {
  return (
    <View style={styles.container}>
      {slots.map((slot) => {
        const isSelected = selectedSlot === slot;

        return (
          <TouchableOpacity
            key={slot}
            activeOpacity={0.9}
            style={[styles.slot, isSelected && styles.selectedSlot]}
            onPress={() => onSelect(slot)}
          >
            <Ionicons
              name="time-outline"
              size={16}
              color={isSelected ? "#FFFFFF" : "#2563EB"}
            />

            <Text style={[styles.text, isSelected && styles.selectedText]}>
              {slot}
            </Text>

            {isSelected && (
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default React.memo(TimeSlotSelector);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",

    flexWrap: "wrap",

    gap: 12,
  },

  slot: {
    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 16,

    paddingVertical: 12,

    borderRadius: 18,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E2E8F0",

    shadowColor: "#2563EB",

    shadowOpacity: 0.05,

    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 2,
  },

  selectedSlot: {
    backgroundColor: "#2563EB",

    borderColor: "#2563EB",

    shadowOpacity: 0.15,
  },

  text: {
    marginLeft: 6,

    color: "#334155",

    fontWeight: "600",

    fontSize: 14,
  },

  selectedText: {
    color: "#FFFFFF",

    fontWeight: "700",

    marginRight: 6,
  },
});
