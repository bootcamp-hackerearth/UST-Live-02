import { Text, StyleSheet, TouchableOpacity } from "react-native";

export const AuthSubmitButton = (props: any) => {
  return (
    <TouchableOpacity style={styles.submitButton} onPress={props.onSubmit}>
      <Text style={styles.buttonText}>{props.titleText}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  submitButton: {
    width: "80%",
    marginTop: 30,
    padding: 10,
    backgroundColor: "#4c1c77",
    borderColor: "rgba(0,0,0,0.3)",
    borderWidth: 1,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "Sans",
    color: "#f0f0f0",
    fontSize: 14,
    lineHeight: 30,
  },
});
