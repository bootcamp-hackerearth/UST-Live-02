import api from "./api.service";

import { getRefreshToken } from "../storage/token.storage";

export const login = (email: string, password: string) => {
  return api.post("/auth/login", {
    loginId: email,
    password,
  });
};

export const createPassword = (data: any) => {
  return api.post("/auth/create-password", data);
};

export const getCurrentUser = () => {
  return api.get("/auth/me");
};

export const logout = async () => {
  const refreshToken = await getRefreshToken();

  return api.post("/auth/logout", {
    refreshToken,
  });
};
