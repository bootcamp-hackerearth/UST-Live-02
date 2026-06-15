import axios from "axios";
import { getToken,clearStorage } from "../storage/authStorage";
import { Alert } from "react-native";
const axiosInstance = axios.create({

  baseURL: "http://10.0.2.2:5000",//For android emulator
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Global Error Handling


axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearStorage();

      Alert.alert(
        "Session Expired",
        "Please login again."
      );

      return Promise.reject(error);
    }

    let message = "";

    if (error.response) {
      message =
        error.response?.data?.message ||
        `Error ${error.response.status}`;
    } else if (error.request) {
      message = "No response from server";
    } else {
      message = error.message;
    }

    Alert.alert("Error", message);

    return Promise.reject(error);
  }
);

export default axiosInstance;