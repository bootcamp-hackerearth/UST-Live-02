import client from "./client";

export const getAppointmentsApi = () =>
  client.get("/appointments");

export const getMyAppointmentsApi = (patientId: string) =>
  client.get(`/appointments/patient/${patientId}`);

export const bookAppointmentApi = (data: any) =>
  client.post("/appointments", data);

export const updateAppointmentApi = (id: string, data: any) =>
  client.put(`/appointments/${id}`, data);

export const deleteAppointmentApi = (id: string) =>
  client.delete(`/appointments/${id}`);

// ── New: fetch all active doctors (no auth required) ──────────────────────────
export const getDoctorsApi = () =>
  client.get("/employees/doctors");

// ── New: fetch available slots for a doctor on a given date ──────────────────
export const getAvailableSlotsApi = (doctorId: string, appointmentDate: string) =>
  client.get("/appointments/available-slots", {
    params: { doctorId, appointmentDate },
  });