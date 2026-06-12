import React from "react";
import { useRoute, RouteProp } from "@react-navigation/native";
import { AppointmentStackParamList } from "../types/navigation";
import AppointmentContainer from "../components/AppointmentContainer";

export default function EditAppointmentScreen() {
  const route =
    useRoute<RouteProp<AppointmentStackParamList, "EditAppointment">>();

  return (
    <AppointmentContainer
      titlePrefix="Modify"
      isEditMode={true}
      appointmentData={route.params?.appointmentData}
    />
  );
}
