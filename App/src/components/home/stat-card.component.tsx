import { View, Text, StyleSheet } from "react-native";

const StatCard = (props: any) => {
  return (
      <View style={styles.statHolder}>
        <Text style={[styles.statTitle, styles.text]}>{props.value}</Text>
        <Text style={[styles.statValue, styles.text]}>{props.title}</Text>
      </View>
  );
};

export default StatCard;

const styles = StyleSheet.create({
  statHolder: {
    backgroundColor: "rgb(222, 222, 222)",
    width: "30%",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderColor: "rgba(61, 11, 105, 0.3)",
    borderWidth: 1,
  },
  statTitle: {
    fontSize: 24,
    lineHeight: 24,
    color: "#4c1c77",
  },
  statValue: {
    fontSize: 12,
    lineHeight: 12,
    color: "rgb(127, 127, 127)",
  },
  text: {
    fontFamily: "Sans",
  },
});
