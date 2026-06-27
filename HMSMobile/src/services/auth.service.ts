import { apiClient } from "./api-client";

export const login = async (email: string, password: string) => {
  return apiClient.post("/auth/login", {
    loginId: email,
    password,
  });
};
export const createPassword = (data: any) => {
  return apiClient.post("/auth/create-password", data);
};

export const forgotPassword = (email: string) => {
  return apiClient.post("/auth/forgot-password", {
    email,
  });
};

export const resetPassword = (data: {
  email: string;
  securityAnswer: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  return apiClient.post("/auth/reset-password", data);
};
