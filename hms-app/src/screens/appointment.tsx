const BgImage = require("../../assets/img/cover.jpg");
import { View, ImageBackground, StyleSheet, ScrollView } from "react-native";
import { WelcomeTextContainer } from "../components/auth/welcome-text-container";
import DateTimePicker from "@react-native-community/datetimepicker";
import ProfileButton from "../components/profile/profile-button.component";
import Toast from "react-native-toast-message";
import { AppointmentModel } from "../types/appointment.types";
import { createAppointment } from "../services/appointment.service";
import { useAppointmentForm } from "../hooks/useAppointmentForm";
import { AppointmentFormBody } from "../components/appointment/appointment-form-body-component";
import { RouteProp, useRoute } from "@react-navigation/native";
import { TabParamList } from "../types/navigation.types";

type AppointmentRouteProp = RouteProp<TabParamList, "appointment">;

export default function AppointmentScreen() {
  const router = useRoute<AppointmentRouteProp>();
  const initialDoctorId = router.params?.doctorId;

  const {
    doctors,
    isShow,
    setIsShow,
    isDateSet,
    isLoading,
    setIsLoading,
    patientId,
    doctorId,
    date,
    availableSlots,
    timeSlot,
    setTimeSlot,
    errors,
    onDateChange,
    setDoctor,
    clearFields,
    validateAppointment,
    showValidationError,
    maxDateLimit,
    goToAppointments,
  } = useAppointmentForm({
    initialDoctorId,
  });

  const sendAppointment = async () => {
    if (!validateAppointment()) {
      showValidationError();
      return;
    }
    try {
      setIsLoading(true);
      const payload: AppointmentModel = {
        appointmentId: "",
        status: "Pending",
        patientId,
        doctorEmployeeId: doctorId,
        timeSlot,
        date,
        createdByEmployeeId: patientId,
      };
      const response = await createAppointment(payload);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: response?.data?.message,
      });
      clearFields();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground source={BgImage} resizeMode="cover" style={styles.wrapper}>
      <View style={styles.overlay}>
        <WelcomeTextContainer
          text1="Create your,"
          text2="APPOINTMENT"
          text3="here."
          isHome={true}
        />

        <ScrollView style={styles.scrollView}>
          <AppointmentFormBody
            formTitle="NEW ENTRY"
            formSubtitle="Book Appointment"
            patientId={patientId}
            date={date}
            isDateSet={isDateSet}
            setIsShow={setIsShow}
            doctors={doctors}
            doctorId={doctorId}
            setDoctor={setDoctor}
            availableSlots={availableSlots}
            timeSlot={timeSlot}
            setTimeSlot={setTimeSlot}
            errors={errors}
            primaryLabel={isLoading ? "CREATING..." : "CREATE"}
            onPrimaryAction={sendAppointment}
            secondaryLabel="CLEAR"
            secondaryIcon="close-outline"
            onSecondaryAction={clearFields}
          />
        </ScrollView>

        <ProfileButton
          title="VIEW APPOINTMENTS"
          iconName="eye-outline"
          onAction={goToAppointments}
        />

        {isShow && (
          <DateTimePicker
            value={date}
            mode="date"
            minimumDate={new Date()}
            maximumDate={maxDateLimit()}
            onChange={(_, value) => {
              if (value) onDateChange(value);
            }}
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
