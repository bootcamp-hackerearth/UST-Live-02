import { View, Text, StyleSheet } from "react-native";

export const WelcomeTextContainer = (props: any) => {
  return (
    <View
      style={
        props.isHome ? styles.homeTextContainer : styles.welcomeTextContainer
      }
    >
      <Text style={[styles.loginText, styles.loginTextWelcome]}>
        {props.text1}
      </Text>
      <Text style={[styles.loginText, styles.loginTextMain]}>
        {props.text2}
      </Text>
      <Text style={[styles.loginText, styles.loginTextSub]}>{props.text3}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  welcomeTextContainer: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginVertical: 100,
    marginHorizontal: 20,
    padding: 10,
    height: "10%",
  },
  homeTextContainer: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginVertical: 60,
    marginHorizontal: 20,
    padding: 10,
    height: "10%",
  },
  loginText: {
    fontFamily: "Sans",
  },
  loginTextWelcome: {
    fontSize: 38,
    lineHeight: 38,
  },
  loginTextMain: {
    fontSize: 48,
    lineHeight: 48,
    color: "#4c1c77",
  },
  loginTextSub: {
    fontSize: 12,
    lineHeight: 10,
    marginVertical: 10,
    color: "#e9e9e9",
    backgroundColor: "#4c1c77",
    borderWidth: 1,
    borderColor: "rgba(75, 11, 81, 0.2)",
    padding: 10,
    borderRadius: 8,
  },
});
