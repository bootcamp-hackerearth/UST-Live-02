import api from "./api.service";

export const getAppointments = async (
  cursor = "",
  search = "",
  status = "ALL",
) => {
  return api.get("/appointments/my", {
    params: {
      pagination: "cursor",
      cursor,
      limit: 5,
      search,
      status,
    },
  });
};
export const clearAppointmentCache = () => {
  return undefined;
};

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
