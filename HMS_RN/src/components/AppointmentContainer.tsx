import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, NavigationProp } from "@react-navigation/native";
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
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfileContext();
  }, []);

  const loadProfileContext = async () => {
    const profileStr = await SecureStore.getItemAsync("patient_profile");
    if (profileStr) setProfile(JSON.parse(profileStr));
  };

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
            onSuccess={() =>
              navigation.reset({
                index: 0,
                routes: [{ name: "ViewAppointments" }],
              })
            }
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
