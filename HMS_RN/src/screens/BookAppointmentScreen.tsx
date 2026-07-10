/**
 * @file BookAppointmentScreen.tsx
 * @overview The screen for creating a new appointment.
 * @description This screen component renders the `AppointmentContainer` in 'create' mode.
 * It acts as a simple wrapper to set up the appointment booking flow.
 * @routes This screen is part of the `AppointmentNavigator` stack.
 * - BOOKAPPOINTMENTSCREEN.TSX -> AppointmentContainer.tsx
 */
import React from "react";
import AppointmentContainer from "../components/AppointmentContainer";

export default function BookAppointmentScreen() {
  return <AppointmentContainer titlePrefix="Create" isEditMode={false} />;
}
