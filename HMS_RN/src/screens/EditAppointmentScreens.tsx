/**
 * @file EditAppointmentScreen.tsx
 * @overview The screen for modifying an existing appointment.
 * @description This screen component renders the `AppointmentContainer` in 'edit' mode. It retrieves the
 * existing appointment data from the route parameters and passes it to the container to pre-fill the form.
 * @routes This screen is part of the `AppointmentNavigator` stack.
 * - EDITAPPOINTMENTSCREEN.TSX -> AppointmentContainer.tsx
 */

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
