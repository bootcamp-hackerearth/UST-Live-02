import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useEffect } from "react";
import { getToken } from "../storage/authStorage";
import PropTypes from "prop-types";
const SplashScreen = ({ navigation }) => {

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const token = await getToken();
      setTimeout(() => {
        if (token) {
          navigation.navigate("Main");
        } else {
          navigation.navigate("Login");
        }
      }, 1500);
    } catch (error) {
      console.log(error);
      navigation.navigate("Login");
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
};

export default SplashScreen;
SplashScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
