import axios from "axios";

import { API_BASE_URL } from "../constants/api";

export const login = async (email: string, password: string) => {
  return axios.post(`${API_BASE_URL}/auth/login`, {
    loginId: email,
    password,
  });
};
export const createPassword = (data: any) => {
  return axios.post(`${API_BASE_URL}/auth/create-password`, data);
};
