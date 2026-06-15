import axios from "axios";
import { Platform } from "react-native";
import { getToken } from "../utils/storage";

const API_BASE_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:5000/api"  //nosonar
    : "http://localhost:5000/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const method = error.config?.method?.toUpperCase();
    const url = error.config?.url;
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    console.log("API ERROR:", method, url, status, message);

    return Promise.reject(error);
  },
);

export default client;
