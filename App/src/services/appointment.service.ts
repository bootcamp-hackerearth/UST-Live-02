import { AppointmentModel } from "../types/appointment.types";
import { UserModel } from "../types/user.types";
import api from "./interceptor.service";

// create appointment
export const createAppointment = async (payload: AppointmentModel) => {
  const response = await api.post("/appointment/createAppointment", payload);
  return response;
};

// get appointment by patient id
export const getAppointmentsByPatientId = async (
  patientId: string,
  selectedText: string,
  page: number,
  limit: number,
) => {
  const response = await api.get<any>("/appointment/getAppointmentsByPatientId", {
    params: {
      patientId,
      selectedText,
      page,
      limit,
    },
  });
  return response;
};

// get doctor by employee id
export const getDoctorByEmployeeId = async (employeeId: string) => {
  const response = await api.get("/appointment/getDoctorByEmployeeId", {
    params: {
      employeeId,
    },
  });

  return response.data as UserModel;
};

// edit appointment
export const editAppointmentData = async (payload: any) => {
  const response = await api.post("/appointment/editAppointment", payload);
  return response;
};

// edit appointment status
export const editAppointmentStatus = async (payload: any) => {
  const response = await api.post(
    "/appointment/editAppointmentStatus",
    payload,
  );
  return response;
};
