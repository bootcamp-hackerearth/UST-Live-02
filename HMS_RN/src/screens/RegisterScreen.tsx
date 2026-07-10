/**
 * @file RegisterScreen.tsx
 * @overview The user self-registration screen.
 * @description This screen allows a new user to create an account. It utilizes the `PatientForm` component
 * to capture all necessary personal and account information. On submission, it calls the `authService`
 * to register the new patient.
 * @routes
 * - `Register`: Accessed from the `LoginScreen`.
 * - Navigates to `Login` on successful registration.
 * @connections
 * - Renders the `PatientForm` component, providing it the `handleRegisterSubmit` callback via the `onSubmit` prop.
 * - `PatientForm` submits valid data -> `handleRegisterSubmit(data)` -> `authService.register(payload)` -> `apiClient.post` -> Backend.
 * - On `authService` success -> `Toast.show()` -> `navigation.navigate("Login")`.
 */
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";
import Toast from "react-native-toast-message";

import PatientForm from "../components/PatientForm";

import { authService } from "../services/authService";

const initialSignupValues = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  gender: undefined,
  dob: undefined,
  bloodGroup: "",
  allergies: "",
  emergencyContact: "",
  line1: "",
  line2: "",
  state: "",
  pincode: "",
};

export default function RegisterScreen() {
  const backgroundImage = require("../../assets/images/hospital3.jpg");
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isLoading, setIsLoading] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleRegisterSubmit = useCallback(
    async (data: any) => {
      setIsLoading(true);
      try {
        let formattedDob = "";
        if (data.dob) {
          const dateObj = new Date(data.dob);
          formattedDob = Number.isNaN(dateObj.getTime())
            ? String(data.dob).split("T")[0]
            : dateObj.toISOString().split("T")[0];
        }

        const formattedBloodGroup =
          data.bloodGroup && data.bloodGroup.trim() !== ""
            ? data.bloodGroup
            : null;

        const formattedAllergies =
          data.allergies && data.allergies.trim() !== ""
            ? data.allergies
                .split(",")
                .map((a: string) => a.trim())
                .filter((a: string) => a.length > 0)
            : [];

        const payload = {
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone.trim(),
          password: data.password,
          gender: data.gender,
          dob: formattedDob,
          bloodGroup: formattedBloodGroup,
          allergies: formattedAllergies,
          emergencyContact: data.emergencyContact
            ? data.emergencyContact.trim()
            : null,
          address: {
            line1: data.line1.trim(),
            line2: data.line2?.trim() || "",
            state: data.state.trim(),
            pincode: Number.parseInt(data.pincode, 10),
          },
        };

        console.log(
          "🚀 FINAL SANITIZED PAYLOAD:",
          JSON.stringify(payload, null, 2),
        );

        await authService.register(payload);

        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Account created successfully.",
        });
        navigation.navigate("Login");
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.message,
        });
      } finally {
        if (isMounted.current) setIsLoading(false);
      }
    },
    [navigation],
  );

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.backgroundImage}
      imageStyle={{ opacity: 0.3 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={[]}
          renderItem={undefined}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <>
              <View style={styles.headerSection}>
                <Text style={styles.headerTitleLine1}>New To,</Text>
                <Text style={styles.headerTitleLine2}>HMS?</Text>
                <View style={styles.subtitleContainer}>
                  <Text style={styles.subtitleText}>
                    Create your account to get started.
                  </Text>
                </View>
              </View>

              <View style={styles.card}>
                <PatientForm
                  initialValues={initialSignupValues}
                  onSubmit={handleRegisterSubmit}
                  isLoading={isLoading}
                  buttonText="Signup"
                  isEditMode={false}
                />

                <TouchableOpacity
                  onPress={() => navigation.navigate("Login")}
                  style={styles.linkButton}
                >
                  <Text style={styles.linkTextRegular}>
                    Already have an account?{" "}
                    <Text style={styles.linkTextPurple}>Login</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          }
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, backgroundColor: "#E6F0F2" },
  safeArea: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 20 },
  headerSection: { marginBottom: 40, marginTop: 20 },
  headerTitleLine1: {
    fontSize: 40,
    color: "#1E1E3F",
    fontFamily: "Montserrat",
  },
  headerTitleLine2: {
    fontSize: 40,
    color: "#4B1D76",
    marginBottom: 10,
    fontFamily: "Lexend",
  },
  subtitleContainer: {
    borderWidth: 1,
    borderColor: "#4B1D76",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  subtitleText: { color: "#1E1E3F", fontSize: 14, fontFamily: "Lexend" },
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
  linkButton: { marginTop: 24, alignItems: "center" },
  linkTextRegular: { color: "#1E1E3F", fontSize: 15, fontFamily: "Lexend" },
  linkTextPurple: { color: "#4B1D76", fontFamily: "Lexend" },
  buttonText: { fontFamily: "Lexend" },
});
