import axios from "axios";

import { API_BASE_URL } from "../constants/api";
import { getToken } from "../storage/token.storage";
export const getDoctors = async () => {
  return axios.get(`${API_BASE_URL}/employees/doctors`);
};
