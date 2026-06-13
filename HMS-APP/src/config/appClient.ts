import axios from "axios";
import { tokenStorage } from "@/storage/tokenStorage";

const BASE_URL = "http://10.0.2.2:5000/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

//interceptors
apiClient.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getToken(); // reads from AsyncStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // attaches to header
  }
  return config;
});

export default apiClient;
