import { PrescriptionGroup } from "./HealthRecord";
export type RootStackParamList = {
  Splash: undefined;

  Login: undefined;

  Register: undefined;

  PatientTabs: undefined;

  BookAppointment: undefined;

  EditProfile: undefined;

  AppointmentDetail: {
    id: string;
  };

  EditAppointment: {
    id: string;
  };
  PrescriptionDetails: {
    prescription: PrescriptionGroup;
  };
};
