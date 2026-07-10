/**
 * @file AppointmentContainer.tsx
 * @overview A container component that wraps the appointment booking and editing forms.
 * @description This component provides the main UI structure (background, titles) for the appointment creation and modification screens.
 * It fetches the patient's profile from secure storage and passes the necessary data down to the `AppointmentForm`.
 * @routes
 * - Used by `BookAppointmentScreen` for creating new appointments.
 * - Used by `EditAppointmentScreen` for modifying existing appointments.
 * @connections
 * - `APPOINTMENTCONTAINER.TSX` (on mount) -> `SecureStore.getItemAsync("patient_profile")` -> Sets patient profile state.
 * - Passes `patientUHID` and `onSuccess` callback down to its child component `AppointmentForm.tsx`.
 * - `onSuccess` callback -> `navigation.reset()` -> Navigates user back to `ViewAppointmentsScreen`.
 */
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  useNavigation,
  NavigationProp,
  useRoute,
} from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";

import AppointmentForm from "./AppointmentForm";

const backgroundImage = require("../../assets/images/hospital3.jpg");

interface AppointmentContainerProps {
  titlePrefix: string;
  isEditMode: boolean;
  appointmentData?: any;
}

export default function AppointmentContainer({
  titlePrefix,
  isEditMode,
  appointmentData,
}: Readonly<AppointmentContainerProps>) {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<any>();
  const preselectedDoctorId = route.params?.preselectedDoctorId;
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfileContext = async () => {
      const profileStr = await SecureStore.getItemAsync("patient_profile");
      if (profileStr && isMounted) setProfile(JSON.parse(profileStr));
    };

    loadProfileContext();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSuccess = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: "ViewAppointments" }],
    });
  }, [navigation]);

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.bg}
      imageStyle={{ opacity: 0.15 }}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.mainTitle}>{titlePrefix} your</Text>
          <Text style={styles.boldTitle}>APPOINTMENT</Text>

          <AppointmentForm
            patientUHID={profile?.UHID}
            isEditMode={isEditMode}
            appointmentData={appointmentData}
            preselectedDoctorId={preselectedDoctorId}
            onSuccess={handleSuccess}
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#E6F0F2" },
  safe: { flex: 1 },
  container: { flex: 1, padding: 24, justifyContent: "center" },
  mainTitle: { fontSize: 40, fontFamily: "Montserrat", color: "#1E1E3F" },
  boldTitle: {
    fontSize: 40,
    fontFamily: "Lexend",
    color: "#4B1D76",
    marginBottom: 8,
  },
});
