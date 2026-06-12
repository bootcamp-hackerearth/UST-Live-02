const BgImage = require("../../assets/img/cover.jpg");
import { useState } from "react";
import { LoginRequestModel } from "../types/auth.types";
import { login } from "../services/auth.service";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { AuthInputText } from "../components/auth/auth-input-text";
import { AuthSubmitButton } from "../components/auth/auth-submit-button";
import { WelcomeTextContainer } from "../components/auth/welcome-text-container";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { NavigationModel } from "../types/navigation.types";
import Toast from "react-native-toast-message";

export default function LoginScreen() {
  const navigator = useNavigation<NativeStackNavigationProp<NavigationModel>>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({ email, password });
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    let error = { email: "", password: "" };
    const emailRegex = /^[a-z0-9._]+@[a-z]+\.[a-z]{2,}$/i;

    if (!email) {
      error.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      error.email = "Email is invalid.";
    }

    if (!password) {
      error.password = "Password is required";
    } else if (password.length < 8) {
      error.password = "Minimum 8 characters required";
    }

    setErrors(error);

    return !error.email && !error.password;
  };

  const sendLogin = async () => {
    const valid = validateForm();
    if (valid) {
      const payload: LoginRequestModel = {
        email: email,
        password: password,
        isClientApp: true,
      };

      try {
        setIsLoading(true);
        await login(payload);
        Toast.show({
          type: "success",
          text1: "Success.",
          text2: "Login Sucessfull",
        });

        navigator.replace("tabs", {
          screen: "home",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    } else {
      Toast.show({
        type: "error",
        text1: "Validation Failed",
        text2: "Please check the input fields",
      });
    }
  };

  return (
    <ImageBackground source={BgImage} resizeMode="cover" style={styles.wrapper}>
      <View style={styles.overlay}>
        <WelcomeTextContainer
          text1="Welcome To,"
          text2="HMS"
          text3="Please login to your account"
          isHome={false}
        />
        <View style={styles.container}>
          <AuthInputText
            innerText="Email"
            getData={(value: string) => {
              setEmail(value);
            }}
            iconName="mail-outline"
          />
          {!!errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}
          <AuthInputText
            innerText="Password"
            getData={(value: string) => {
              setPassword(value);
            }}
            isPassword={true}
            iconName="key-outline"
          />
          {!!errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
          <AuthSubmitButton
            titleText={isLoading ? "Logging In..." : "Login"}
            onSubmit={sendLogin}
          />
          <TouchableOpacity
            style={styles.loginFooter}
            onPress={() => navigator.navigate("signup")}
          >
            <Text style={styles.loginFooterText}>Don't have an account?</Text>
            <Text style={[styles.loginFooterText, styles.signUp]}> Signup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#e1e1e1",
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },

  welcomeTextContainer: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginVertical: 100,
    marginHorizontal: 20,
    padding: 10,
    height: "20%",
  },
  container: {
    height: "50%",
    backgroundColor: "#f2f2f2",
    borderRadius: 30,
    margin: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  errorText: {
    color: "#ef2121",
    fontSize: 13,
    width: "80%",
    borderLeftWidth: 4,
    borderColor: "#cd1717",
    borderRadius: 4,
    marginTop: 5,
    paddingHorizontal: 10,
  },
  loginFooter: {
    marginTop: 40,
    flexDirection: "row",
  },
  loginFooterText: {
    color: "black",
    fontFamily: "Sans",
    fontSize: 14,
  },
  signUp: {
    color: "#4c1c77",
  },
});
