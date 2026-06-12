import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

type DateHolderProps = Readonly<{
  date: Date;
  setIsShow: (value: boolean) => void;
  isDateSet: boolean;
}>;

export function DateHolder({ date, setIsShow, isDateSet }: DateHolderProps) {
  return (
    <TouchableOpacity
      onPress={() => {
        setIsShow(true);
      }}
      style={styles.dateHolder}
    >
      <View style={styles.dateHeader}>
        <Ionicons
          name="alarm-outline"
          size={22}
          color={"#cfcfcf"}
          style={styles.dateIcon}
        />
        <Text style={[styles.dateTitle, styles.text]}>
          {isDateSet ? date.toDateString() : "Date"}
        </Text>
      </View>
      <Ionicons name="chevron-down-outline" size={22} color={"#4f0d68"} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dateHolder: {
    flexDirection: "row",
    backgroundColor: "rgb(222, 222, 222)",
    borderWidth: 1,
    borderColor: "rgba(83, 11, 107, 0.3)",
    borderRadius: 10,
    padding: 8,
    marginHorizontal: 20,
    marginVertical: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateTitle: {
    color: "rgb(39, 39, 39)",
    fontFamily: "Sans",
    fontSize: 14,
    lineHeight: 14,
    marginLeft: 13,
  },
  dateIcon: {
    backgroundColor: "rgb(108, 19, 109)",
    borderWidth: 1,
    borderColor: "rgba(198, 53, 255, 0.2)",
    borderRadius: 10,
    padding: 10,
  },
  text: {
    fontFamily: "Sans",
  },
});
