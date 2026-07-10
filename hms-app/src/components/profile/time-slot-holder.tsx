import { Ionicons } from "@expo/vector-icons";
import { Text, StyleSheet, TouchableOpacity } from "react-native";

export const TimeSlotHolder = (props: any) => {
  return (
    <TouchableOpacity
      style={[styles.slotHolder, props.isSelected && styles.slotHolderSelected]}
      onPress={() => props.onAction(props.slot)}
    >
      <Ionicons name="alarm-outline" color={"rgb(89, 27, 111)"} size={22} />
      <Text style={[styles.text, styles.timeSlot]}>{props.slot}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  slotHolder: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    backgroundColor: "rgba(184, 184, 184, 0.5)",
    borderColor: "rgba(131, 27, 155, 0.3)",
    borderWidth: 1,
    borderRadius: 10,
    margin: 5,
  },
  slotHolderSelected: {
    backgroundColor: "rgb(255, 246, 255)",
  },
  timeSlot: {
    color: "#343434",
    fontSize: 14,
    lineHeight: 14,
    marginLeft: 3,
  },
  text: {
    fontFamily: "Sans",
  },
});
