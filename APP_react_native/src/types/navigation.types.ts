import { NavigatorScreenParams } from "@react-navigation/native";
import { AppointmentModel } from "./appointment.types";

export type NavigationModel = {
  login: undefined;
  signup: undefined;
  tabs: NavigatorScreenParams<TabParamList>;
  viewAppointment: undefined;
  editAppointment: { appointment: AppointmentModel };
  editProfile: undefined;
};

export type TabParamList = {
  home: undefined;
  profile: undefined;
  appointment: undefined;
};
