const BgImage = require("../../assets/img/cover.jpg");
import {
  ImageBackground,
  View,
  StyleSheet,
  Text,
  FlatList,
} from "react-native";
import { WelcomeTextContainer } from "../components/auth/welcome-text-container";
import { AppointmentCard } from "../components/appointment/appointment-card.component";
import { useEffect, useState } from "react";
import { AppointmentModel } from "../types/appointment.types";
import ProfileButton from "../components/profile/profile-button.component";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { NavigationModel } from "../types/navigation.types";
import { useNavigation } from "@react-navigation/native";
import { getAppointmentsByPatientId } from "../services/appointment.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FormHeader } from "../components/appointment/form-header.component";

export default function ViewAppointmentScreen() {
  const navigator = useNavigation<NativeStackNavigationProp<NavigationModel>>();

  const [appointments, setAppointments] = useState<AppointmentModel[]>([]);

  const goToHome = () => {
    navigator.navigate("tabs", {
      screen: "appointment",
    });
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const patientId = await AsyncStorage.getItem("patientId");
      const data = await getAppointmentsByPatientId(patientId || "");
      setAppointments(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ImageBackground source={BgImage} resizeMode="cover" style={styles.wrapper}>
      <View style={styles.overlay}>
        <WelcomeTextContainer
          text1="View your,"
          text2="APPOINTMENTS"
          text3="here."
        ></WelcomeTextContainer>

        <ProfileButton
          title="GO BACK"
          iconName="arrow-back-outline"
          onAction={goToHome}
        />

        <View style={styles.container}>
          
          <FormHeader title="SCHEDULE" value="Your Appointments"/>

          {appointments.length === 0 && (
            <Text style={[styles.noAppointmentsText, styles.text]}>
              No appointments scheduled.
            </Text>
          )}

          <FlatList
            data={appointments}
            keyExtractor={(item) => item.appointmentId}
            renderItem={({ item }) => {
              return (
                <AppointmentCard
                  doctorEmployeeId={item.doctorEmployeeId}
                  status={item.status}
                  date={item.date}
                  timeSlot={item.timeSlot}
                  appointmentId={item.appointmentId}
                  onAppointmentChange={fetchAppointments}
                />
              );
            }}
          ></FlatList>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  scrollView: {
    height: 400,
  },
  container: {
    flex: 1,
    borderRadius: 35,
    margin: 20,
    borderColor: "rgba(207, 75, 255, 0.2)",
    backgroundColor: "#f2f2f2",
    borderWidth: 1,
    paddingBottom: 20,
  },
  formHeader: {
    padding: 20,
    flexDirection: "row",
  },
  formHeaderIcon: {
    padding: 15,
    backgroundColor: "rgb(108, 19, 109)",
    borderRadius: 100,
  },
  formHeaderTextHolder: {
    flexDirection: "column",
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  formHeaderTitle: {
    fontSize: 10,
    lineHeight: 18,
    color: "#909090",
  },
  formHeaderValue: {
    fontSize: 18,
    lineHeight: 18,
    color: "#505050",
  },
  text: {
    fontFamily: "Sans",
  },
  noAppointmentsText: {
    color: "white",
    fontSize: 12,
    lineHeight: 12,
    textAlign: "center",
    backgroundColor: "rgb(75, 12, 67)",
    padding: 10,
  },
});
