import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function ProfileButton(props: any) {
  return (
    <TouchableOpacity style={styles.buttonHolder} onPress={props.onAction}>
      <Ionicons
        name={props.iconName}
        color={"rgb(221, 221, 221)"}
        size={20}
        style={styles.iconStyle}
      />
      <Text style={[styles.text, styles.buttonText]}>{props.title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonHolder: {
    flexDirection: "row",
    backgroundColor: "rgb(223, 223, 223)",
    borderWidth: 1,
    borderColor: "rgba(82, 15, 111, 0.3)",
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 20,
    marginVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "rgb(41, 41, 41)",
    fontSize: 12,
    lineHeight: 12,
    marginLeft: 10,
  },
  iconStyle: {
    backgroundColor: "rgb(100, 20, 109)",
    borderRadius: 8,
    padding: 5,
  },
  text: {
    fontFamily: "Sans",
  },
});
