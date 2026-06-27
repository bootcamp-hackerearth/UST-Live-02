import { apiClient } from "./api-client";

export const getDashboard = async () => {
  return apiClient.get("/patients/dashboard");
};

export const registerPatient = (data: any) => {
  return apiClient.post("/patients/register", data);
};
export const getProfile = async () => {
  return apiClient.get("/patients/profile");
};

export const updateProfile = async (data: any) => {
  return apiClient.put("/patients/profile", data);
};
