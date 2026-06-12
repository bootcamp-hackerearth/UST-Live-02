import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";
import { authService } from "../services/authService";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function LoginScreen() {
  const [secure, setSecure] = useState(true);
  const backgroundImage = require("../../assets/images/hospital3.jpg");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleLoginPress = async () => {
    const trimmedEmail = email.trim();

    if (trimmedEmail === "" || password === "") {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter both email and password",
      });
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      await authService.login(trimmedEmail, password);

      navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Authentication Failed",
        text2: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.backgroundImage}
      imageStyle={{ opacity: 0.3 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.headerSection}>
            <Text style={styles.headerTitleLine1}>Welcome Back</Text>
            <Text style={styles.headerTitleLine2}>Sign In.</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <Feather
                name="mail"
                size={20}
                color="#6B7280"
                style={styles.icon}
              />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError("");
                }}
                style={[
                  styles.input,
                  emailError ? styles.inputError : null,
                  { flex: 1 },
                ]}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="onepassword"
                size={20}
                color="#6B7280"
                style={styles.icon}
              />

              <TextInput
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                style={[styles.input, { flex: 1 }]}
                secureTextEntry={secure}
                autoCapitalize="none"
              />

              <TouchableOpacity onPress={() => setSecure(!secure)}>
                <Feather
                  name={secure ? "eye-off" : "eye"}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLoginPress}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              style={styles.linkButton}
            >
              <Text style={styles.linkTextRegular}>
                Don't have an account?{" "}
                <Text style={styles.linkTextPurple}>Register</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: "#E6F0F2",
  },
  text: {
    fontFamily: "Lexend",
  },
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  headerSection: {
    marginBottom: 40,
    marginTop: -40,
  },
  headerTitleLine1: {
    fontSize: 40,
    fontFamily: "Montserrat",
    color: "#1E1E3F",
  },
  headerTitleLine2: {
    fontSize: 40,
    color: "#4B1D76",
    marginBottom: 10,
    fontFamily: "Lexend",
  },
  card: {
    backgroundColor: "#F8F9FA",
    padding: 24,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: "100%",
  },

  icon: {
    marginRight: 8,
  },

  input: {
    height: 50,
    color: "#111827",
  },
  inputError: {
    borderColor: "#ef4444",
    borderWidth: 1,
    marginBottom: 8,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 8,
  },
  button: {
    backgroundColor: "#4B1D76",
    padding: 18,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#4B1D76",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: { backgroundColor: "#8b5cf6" },
  buttonText: { color: "#ffffff", fontSize: 16, fontFamily: "Lexend" },
  linkButton: { marginTop: 24, alignItems: "center" },
  linkTextRegular: { color: "#1E1E3F", fontSize: 15, fontFamily: "Lexend" },
  linkTextPurple: { color: "#4B1D76", fontFamily: "Lexend" },
  TextInput: { fontFamily: "Lexend" },
});
