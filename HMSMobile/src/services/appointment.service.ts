import api from "./api.service";
import { registerCacheClear } from "./cache.service";

let appointmentCache: Record<string, any> = {};

export const getAppointments = async (
  cursor = "",
  search = "",
  status = "ALL",
) => {
  const key = `${cursor}-${search}-${status}`;

  if (appointmentCache[key]) {
    return {
      data: appointmentCache[key],
    };
  }

  const response = await api.get("/appointments/my", {
    params: {
      pagination: "cursor",
      cursor,
      limit: 5,
      search,
      status,
    },
  });

  appointmentCache[key] = response.data;

  return response;
};
export const clearAppointmentCache = () => {
  appointmentCache = {};
};

registerCacheClear(clearAppointmentCache);

export const getAppointmentById = (id: string) =>
  api.get(`/appointments/my/${id}`);

export const cancelMyAppointment = (id: string) =>
  api.patch(`/appointments/my/${id}/cancel`);

export const getAvailableSlots = (doctorId: string, appointmentDate: string) =>
  api.get("/appointments/available-slots", {
    params: {
      doctorId,
      appointmentDate,
    },
  });

export const bookAppointment = (data: unknown) =>
  api.post("/appointments/patient/book", data);

export const updateMyAppointment = (id: string, data: unknown) =>
  api.put(`/appointments/my/${id}`, data);
