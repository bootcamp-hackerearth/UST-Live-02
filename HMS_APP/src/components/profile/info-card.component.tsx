import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";

export const InfoCard = (props: any) => {
  return (
    <View style={styles.infoCard}>
      <Ionicons
        name={props.iconName}
        color="rgb(224, 224, 224)"
        size={20}
        style={styles.infoIcon}
      />
      <View style={styles.infoData}>
        <Text
          style={[styles.text, styles.infoText]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {props.title}
        </Text>
        <Text
          style={[styles.text, styles.infoValue]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {props.value}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: "rgb(222, 222, 222)",
    borderWidth: 1,
    borderColor: "rgba(83, 11, 107, 0.3)",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  infoIcon: {
    backgroundColor: "rgb(95, 24, 121)",
    padding: 10,
    borderRadius: 12,
    marginLeft: 10,
  },
  infoData: {
    alignItems: "flex-start",
    justifyContent: "center",
    marginLeft: 10,
    width: "80%",
  },
  infoText: {
    color: "rgba(88, 88, 88, 0.7)",
    fontSize: 10,
    lineHeight: 10,
  },
  infoValue: {
    color: "rgb(43, 42, 42)",
    fontSize: 14,
    flexShrink: 1,
    lineHeight: 20,
  },
  text: {
    fontFamily: "Sans",
  },
});
