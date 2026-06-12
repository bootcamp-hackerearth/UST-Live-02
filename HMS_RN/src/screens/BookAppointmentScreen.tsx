import React from "react";
import AppointmentContainer from "../components/AppointmentContainer";

export default function BookAppointmentScreen() {
  return <AppointmentContainer titlePrefix="Create" isEditMode={false} />;
}
