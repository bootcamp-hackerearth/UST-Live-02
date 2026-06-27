import { apiClient } from "./api-client";

type ListParams = {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
};

export const getAppointments = async (params: ListParams = {}) => {
  return apiClient.get("/appointments", {
    params,
  });
};
export const getAppointmentById = async (id: string) => {
  return apiClient.get(`/appointments/${id}`);
};
export const cancelAppointment = async (id: string) => {
  return apiClient.patch(`/appointments/my/${id}/cancel`, null);
};
export const getAvailableSlots = async (
  doctorId: string,
  appointmentDate: string,
) => {
  return apiClient.get("/appointments/available-slots", {
    params: {
      doctorId,
      appointmentDate,
    },
  });
};
export const bookAppointment = async (data: any) => {
  return apiClient.post("/appointments/patient/book", data);
};
export const updateMyAppointment = async (id: string, data: any) => {
  return apiClient.put(`/appointments/my/${id}`, data);
};
