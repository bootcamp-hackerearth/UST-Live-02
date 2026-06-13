import client from "./client";

export const getPatientByUserIdApi = (userId: string) =>
  client.get(`/patients/${userId}`);

export const getProfileApi = () =>
  client.get("/patients/profile");

export const updateProfileApi = (data: any) =>
  client.put("/patients/profile", data);

export const getMyPatientAppointmentsApi = () =>
  client.get("/appointments/my");

export const updatePatientAppointmentApi = (id: string, data: any) =>
  client.put(`/appointments/${id}`, data);
