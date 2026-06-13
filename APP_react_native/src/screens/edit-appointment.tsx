const BgImage = require("../../assets/img/cover.jpg");
import { View, ImageBackground, StyleSheet, ScrollView, Alert } from "react-native";
import { WelcomeTextContainer } from "../components/auth/welcome-text-container";
import DateTimePicker from "@react-native-community/datetimepicker";
import ProfileButton from "../components/profile/profile-button.component";
import Toast from "react-native-toast-message";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { NavigationModel } from "../types/navigation.types";
import { editAppointmentData, editAppointmentStatus } from "../services/appointment.service";
import { useAppointmentForm } from "../hooks/useAppointmentForm";
import { AppointmentFormBody } from "../components/appointment/appointment-form-body-component";
import React from "react";

export default function EditAppointmentScreen() {
  const route = useRoute<RouteProp<NavigationModel, "editAppointment">>();
  const { appointment } = route.params;
  const navigator = useNavigation<NativeStackNavigationProp<NavigationModel>>();

  const {
    doctors, isShow, setIsShow, isDateSet, isLoading, setIsLoading,
    patientId, doctorId, date, availableSlots, timeSlot, setTimeSlot, errors,
    onDateChange, setDoctor, validateAppointment, showValidationError,
    maxDateLimit, goToAppointments,
  } = useAppointmentForm({ initialAppointment: appointment });

  const [isCancelLoading, setIsCancelLoading] = React.useState(false);

  const cancelAppointment = async () => {
    try {
      setIsCancelLoading(true);
      const response = await editAppointmentStatus({
        appointmentId: appointment.appointmentId,
        status: "Cancelled",
      });
      Alert.alert("Success", response?.data?.message);
      navigator.navigate("viewAppointment");
    } catch (err) {
      console.error(err);
    } finally {
      setIsCancelLoading(false);
    }
  };

  const editAppointment = async () => {
    if (!validateAppointment()) {
      showValidationError();
      return;
    }
    try {
      setIsLoading(true);
      const response = await editAppointmentData({
        appointmentId: appointment.appointmentId,
        patientId,
        doctorEmployeeId: doctorId,
        timeSlot,
        date,
        status: "Pending",
      });
      Toast.show({ type: "success", text1: "Success", text2: response?.data?.message });
      navigator.navigate("viewAppointment");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground source={BgImage} resizeMode="cover" style={styles.wrapper}>
      <View style={styles.overlay}>
        <WelcomeTextContainer text1="Edit your," text2="APPOINTMENT" text3="here." />

        <ProfileButton title="GO BACK" iconName="arrow-back-outline" onAction={goToAppointments} />

        <ScrollView style={styles.scrollView}>
          <AppointmentFormBody
            formTitle="MODIFY ENTRY"
            formSubtitle="Edit Appointment"
            patientId={patientId}
            date={date}
            isDateSet={isDateSet}
            setIsShow={setIsShow}
            doctors={doctors}
            doctorId={appointment.doctorEmployeeId}
            setDoctor={setDoctor}
            availableSlots={availableSlots}
            timeSlot={timeSlot}
            setTimeSlot={setTimeSlot}
            errors={errors}
            primaryLabel={isLoading ? "SAVING..." : "SAVE"}
            onPrimaryAction={editAppointment}
          />
        </ScrollView>

        <ProfileButton
          title={isCancelLoading ? "CANCELING..." : "CANCEL APPOINTMENT"}
          iconName="close-outline"
          onAction={cancelAppointment}
        />
        <ProfileButton title="VIEW APPOINTMENTS" iconName="eye-outline" onAction={goToAppointments} />

        {isShow && (
          <DateTimePicker
            value={date}
            mode="date"
            minimumDate={new Date()}
            maximumDate={maxDateLimit()}
            onChange={(_, value) => { if (value) onDateChange(value); }}
          />
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  overlay: { flex: 1, backgroundColor: "rgba(255, 255, 255, 0.8)" },
  scrollView: { height: 450 },
});
