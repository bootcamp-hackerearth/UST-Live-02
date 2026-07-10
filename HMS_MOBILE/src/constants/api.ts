import Constants from "expo-constants";
import { Platform } from "react-native";

const API_PATH = "/api";
const DEFAULT_PORT = "5000";
const PRODUCTION_API_BASE_URL = "https://bootstraphms.duckdns.org/api";

const getExpoHost = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost;

  return hostUri?.split(":")[0];
};

const getDevelopmentApiBaseUrl = () => {
  if (Platform.OS === "android") {
    return `http://10.0.2.2:${DEFAULT_PORT}${API_PATH}`;
  }

  const expoHost = getExpoHost();

  if (expoHost && expoHost !== "localhost" && expoHost !== "127.0.0.1") {
    return `http://${expoHost}:${DEFAULT_PORT}${API_PATH}`;
  }

  return `http://localhost:${DEFAULT_PORT}${API_PATH}`;
};

const normalizeApiBaseUrl = (url: string) => {
  let end = url.length;
  while (end > 0 && url[end - 1] === "/") end--;
  return url.slice(0, end);
};

export const API_BASE_URL = normalizeApiBaseUrl(
  process.env.EXPO_PUBLIC_API_BASE_URL ||
    (__DEV__ ? getDevelopmentApiBaseUrl() : PRODUCTION_API_BASE_URL),
);

export const FILE_BASE_URL = API_BASE_URL.replace(/\/api$/, "");
