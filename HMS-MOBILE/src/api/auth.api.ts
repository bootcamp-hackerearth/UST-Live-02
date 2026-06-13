import client from "./client";

export const loginApi = (data: any) =>
  client.post("/auth/login", data);

export const signupApi = (data: any) =>
  client.post("/auth/signupPatient", data);

export const resetPasswordApi = (data: any) =>
  client.post("/auth/reset-password", data);