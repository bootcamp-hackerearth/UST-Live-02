import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";
import Constants from "expo-constants";
import { jwtDecode } from "jwt-decode";

const API_URL = Constants.expoConfig?.extra?.API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let isRefreshing: boolean = false;
let newTokenPromise: Promise<string> | null = null;

// token attacher
api.interceptors.request.use(
  async (config) => {
    // skipping token for login and signup
    if (
      config.url === "auth/login" ||
      config.url === "auth/patientSignUp" ||
      config.url === "auth/refresh-token"
    ) {
      return config;
    }

    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      throw new Error("No Authentication Found");
    }

    const decoded = jwtDecode<{ exp: number }>(token ?? "");
    const isExpired = decoded.exp * 1000 < Date.now();

    if (isExpired) {
      if (!isRefreshing) {
        isRefreshing = true;
        newTokenPromise = api
          .get("auth/refresh-token")
          .then(async (res) => {
            const newToken = res.data.token;
            await SecureStore.setItemAsync("token", newToken);
            return newToken;
          })
          .catch(async (error) => {
            await SecureStore.deleteItemAsync("token");
            Alert.alert("Session Expired", "Please login again.");
            throw error;
          })
          .finally(() => {
            isRefreshing = false;
            newTokenPromise = null;
          });
      }
      const newToken = await newTokenPromise!;
      config.headers.Authorization = `Bearer ${newToken}`;
      return config;
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
  async (error) => {
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

    throw error;
  },
);

export default api;
