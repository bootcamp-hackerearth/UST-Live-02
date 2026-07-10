import api from "./interceptor.service";
import { PatientModel, UserModel } from "../types/user.types";

export const getDoctors = async () => {
  const response = await api.get("appointment/getDoctors");
  return response.data as UserModel[];
};

export const getPatientProfile = async (email: string) => {
  const response = await api.get("user/getPatientProfile", {
    params: {
      email,
    },
  });
  return response.data as PatientModel;
};

export const getPatientId = async (email: string) => {
  const response = await api.get("user/getPatientId", {
    params: {
      email,
    },
  });
  return response.data.patientId;
};

export const getAvailableTimeSlots = async (employeeId: string, date: Date) => {
  const response = await api.get("user/getAvailableTimeSlots", {
    params: {
      employeeId: employeeId,
      date: date,
    },
  });
  return response.data.slots;
};

export const updatePatientProfile = async (payload: any) => {
  const response = await api.post("user/updatePatientProfile", payload);
  return response;
};