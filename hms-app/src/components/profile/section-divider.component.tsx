import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";

export const SectionDivider = (props: any) => {
  return (
    <View style={styles.sectionDivider}>
      <Ionicons name={props.iconName} color={"rgb(92, 23, 113)"} size={20} />
      <Text style={[styles.sectionTitle, styles.text]}>{props.title}</Text>
      <View style={styles.divider}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionDivider: {
    marginHorizontal: 20,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    color: "rgb(92, 23, 113)",
    fontSize: 13,
    lineHeight: 16,
    marginLeft: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    marginLeft: 10,
    backgroundColor: "rgb(92, 23, 113)",
  },
  text: {
    fontFamily: "Sans",
  },
});
