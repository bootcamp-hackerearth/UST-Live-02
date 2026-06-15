import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { loginPatient } from "../services/patientApi";
import { saveLoginData } from "../storage/authStorage";
import { validateField } from "../utils/validation";
import PropTypes from "prop-types";

const LoginScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const validate = () => {
    const newErrors = {
      email: validateField(form.email, "Email", "email"),
      password: validateField(form.password, "Password", "password"),
    };

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => !error);
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      //PayLoad
      const response = await loginPatient(form);

      await saveLoginData(response.token, response.user, response.patient);
      navigation.navigate("Main");
    } catch (error) {
      console.log("FULL ERROR:", error);
      console.log("STATUS:", error?.response?.status);
      console.log("DATA:", error?.response?.data);
      console.log("MESSAGE:", error?.message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    validateField(form.email, "Email", "email") === "" &&
    validateField(form.password, "Password", "password") === "";

  return (
    <ImageBackground
      source={require("../../assets/images/loginpng.png")}
      resizeMode="cover"
      imageStyle={{
        opacity: 0.25,
      }}
      style={styles.background}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome To,</Text>
          <Text style={styles.hmsText}>HMS</Text>

          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>Please login to your account</Text>
          </View>
        </View>

        {/* CARD */}
        <View style={styles.card}>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={24} color="#000" />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#555"
              style={styles.input}
              value={form.email}
              onChangeText={(v) => handleChange("email", v)}
              onBlur={() => {
                setTouched({
                  ...touched,
                  email: true,
                });

                setErrors({
                  ...errors,
                  email: validateField(form.email, "Email", "email"),
                });
              }}
            />

            {touched.email && errors.email ? (
              <Text style={styles.error}>{errors.email}</Text>
            ) : null}
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="key-outline" size={24} color="#000" />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#555"
              style={styles.input}
              value={form.password}
              onChangeText={(v) => handleChange("password", v)}
              secureTextEntry={!showPassword}
              onBlur={() => {
                setTouched({
                  ...touched,
                  password: true,
                });

                setErrors({
                  ...errors,
                  password: validateField(
                    form.password,
                    "Password",
                    "password",
                  ),
                });
              }}
            />

            {touched.password && errors.password ? (
              <Text style={styles.error}>{errors.password}</Text>
            ) : null}
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={22}
                color="#444"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              !isFormValid && {
                opacity: 0.5,
              },
            ]}
            disabled={!isFormValid || loading}
            onPress={handleLogin}
          >
            <Text style={styles.loginText}>
              {loading ? "Signing In..." : "Login"}
            </Text>
          </TouchableOpacity>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.signupLink}> Signup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

LoginScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

export default LoginScreen;

const PRIMARY = "#5A1E96";

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  header: {
    paddingTop: 80,
    paddingHorizontal: 20,
  },

  welcomeText: {
    fontSize: 42,
    fontWeight: "800",
    color: "#1F1F1F",
  },

  hmsText: {
    fontSize: 56,
    fontWeight: "900",
    color: PRIMARY,
    marginBottom: 15,
  },

  tagContainer: {
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },

  tagText: {
    fontSize: 15,
    color: "#222",
  },

  card: {
    marginTop: 190,
    backgroundColor: "#EFEFEF",
    marginHorizontal: 10,
    borderRadius: 40,
    paddingHorizontal: 25,
    paddingTop: 45,
    paddingBottom: 45,
    elevation: 12,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#222",
    paddingBottom: 14,
    marginBottom: 30,
  },

  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#111",
  },

  loginButton: {
    backgroundColor: PRIMARY,
    height: 65,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  loginText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 35,
  },

  signupText: {
    fontSize: 15,
    color: "#222",
  },

  signupLink: {
    fontSize: 15,
    color: PRIMARY,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: -22,
    marginBottom: 15,
    marginLeft: 5,
  },
});
