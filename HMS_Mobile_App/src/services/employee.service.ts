import axios from "axios";

import { API_BASE_URL } from "../constants/api";

export const getDoctors = async () => {
  return axios.get(`${API_BASE_URL}/employees/doctors`);
};
