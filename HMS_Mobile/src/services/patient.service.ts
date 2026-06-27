import api from "./api.service";

export const getDashboard = () => api.get("/patients/dashboard");

export const registerPatient = (data: any) =>
  api.post("/patients/register", data);
export const getProfile = () => api.get("/patients/profile");

export const updateProfile = (data: any) => api.put("/patients/profile", data);
