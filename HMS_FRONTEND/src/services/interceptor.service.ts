import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";

const api = axios.create({
  baseURL: "http://10.0.2.2:8080",
});

// token attacher
api.interceptors.request.use(
  async (config) => {
    // skipping token for login and signup
    if (config.url === "auth/login" || config.url === "auth/patientSignUp") {
      return config;
    }

    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      throw new Error("No Authentication Found");
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => {
    throw err;
  },
);

// centralized error handling system
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "";

    if (error.response) {
      message =
        error.response?.data?.message || `Error ${error.response.status}`;
    } else if (error.request) {
      message = "No response from the server";
    } else {
      message = error?.message;
    }

    Alert.alert("Failed", message);

    return Promise.reject(error);
  },
);

export default api;
