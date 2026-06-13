import apiClient from "../config/appClient";

export const getDoctors = async () => {
  const response = await apiClient.get("/doctors/list");
  return response.data.data;
};