import { Ionicons } from "@expo/vector-icons";
import { TextInput, StyleSheet, View } from "react-native";

export const AuthInputText = (props: any) => {
  return (
    <View style={styles.container}>
      <Ionicons name={props.iconName} size={20} color="#828282" />
      <TextInput
        placeholder={props.innerText}
        placeholderTextColor="#828282"
        style={styles.textInput}
        onChangeText={props.getData}
        secureTextEntry={props.isPassword ?? false}
        numberOfLines={1}
      ></TextInput>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "80%",
    height: 60,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "rgba(0,0,0,0.2)",
    borderWidth: 1,
  },
  textInput: {
    fontFamily: "Sans",
    fontSize: 14,
    lineHeight: 14,
    height: "100%",
    flex:1,
    width: "100%",
    borderRadius: 16,
    color: "black",
    marginLeft: 10,
  },
});
