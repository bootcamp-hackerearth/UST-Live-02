import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";

export function FormHeader(props: any) {
  return (
    <View style={styles.formHeader}>
      <Ionicons
        name="calendar-outline"
        color={"white"}
        size={25}
        style={styles.formHeaderIcon}
      />
      <View style={styles.formHeaderTextHolder}>
        <Text style={[styles.text, styles.formHeaderTitle]}>{props.title}</Text>
        <Text style={[styles.text, styles.formHeaderValue]}>{props.value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formHeader: {
    padding: 20,
    flexDirection: "row",
  },
  formHeaderIcon: {
    padding: 15,
    backgroundColor: "rgb(108, 19, 109)",
    borderRadius: 100,
  },
  formHeaderTextHolder: {
    flexDirection: "column",
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  formHeaderTitle: {
    fontSize: 10,
    lineHeight: 18,
    color: "#909090",
  },
  formHeaderValue: {
    fontSize: 18,
    lineHeight: 18,
    color: "#505050",
  },
  text: {
    fontFamily: "Sans",
  },
});
