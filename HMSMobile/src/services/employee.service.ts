import { apiClient } from "./api-client";

export const getDoctors = async () => {
  return apiClient.get("/employees/doctors");
};
