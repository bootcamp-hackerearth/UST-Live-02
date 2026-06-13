import client from "./client";

export const getProfileApi = () =>
  client.get("/patients/profile");

export const updateProfileApi = (data: any) =>
  client.put("/patients/profile", data);

export const getMyPatientAppointmentsApi = () =>
  client.get("/patients/patient");

export const updateMyProfileApi = (data: any) =>
  client.put("/patients/profile", data);

