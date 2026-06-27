import { Platform } from "react-native";

const fallbackHost = Platform.OS === "android" ? "10.0.2.2" : "localhost";

export const API_BASE_URL = `http://${fallbackHost}:5000/api`;
