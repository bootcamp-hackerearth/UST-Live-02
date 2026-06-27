export type RootStackParamList = {
  Splash: undefined;

  Login: undefined;

  Register: undefined;

  PatientTabs: undefined;

  BookAppointment: undefined;

  EditProfile: undefined;

  CreatePassword: {
    loginId: string;
  };

  ForgotPassword: undefined;

  AppointmentDetail: {
    id: string;
  };

  EditAppointment: {
    id: string;
  };

  PrescriptionDetail: {
    id: string;
  };

  HealthRecordDetail: {
    id: string;
  };
};
