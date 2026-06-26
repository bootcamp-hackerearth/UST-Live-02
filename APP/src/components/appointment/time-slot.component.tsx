import { View, Text, StyleSheet } from "react-native";
import { TimeSlotHolder } from "../profile/time-slot-holder";

type TimeSlotPropsType = Readonly<{
  availableSlots: string[];
  setTimeSlot: (value: string) => void;
  timeSlot: string;
}>;

export default function TimeSlotComponent({
  availableSlots,
  setTimeSlot,
  timeSlot,
}: TimeSlotPropsType) {
  return (
    <View style={styles.timeSlotContainer}>
      {availableSlots.length === 0 ? (
        <Text style={[styles.text, styles.slotText]}>
          No slot available at this moment
        </Text>
      ) : (
        availableSlots.map((slot) => {
          return (
            <TimeSlotHolder
              slot={slot}
              onAction={setTimeSlot}
              id={slot}
              key={slot}
              isSelected={timeSlot === slot}
            />
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  timeSlotContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontFamily: "Sans",
  },
  slotText: {
    color: "#767676",
    backgroundColor: "rgb(222, 222, 222)",
    borderWidth: 1,
    borderColor: "rgba(83, 11, 107, 0.3)",
    borderRadius: 10,
    padding: 5,
    paddingHorizontal: 20,
    fontSize: 15,
    lineHeight: 15,
    marginTop: 20,
  },
});
