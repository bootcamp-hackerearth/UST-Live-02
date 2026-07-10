import Constants from "expo-constants";
import { Platform } from "react-native";

const API_PATH = "/api";
const DEFAULT_PORT = "5000";
const PRODUCTION_API_BASE_URL = "https://hmshealthcare.duckdns.org/api";

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

const trimTrailingSlashes = (url: string) => {
  let endIndex = url.length;

  while (endIndex > 0 && url[endIndex - 1] === "/") {
    endIndex -= 1;
  }

  return url.slice(0, endIndex);
};

const removeApiPath = (url: string) =>
  url.endsWith(API_PATH) ? url.slice(0, -API_PATH.length) : url;

const normalizeApiBaseUrl = (url: string) => trimTrailingSlashes(url);

export const API_BASE_URL = normalizeApiBaseUrl(
  process.env.EXPO_PUBLIC_API_BASE_URL ||
    (__DEV__ ? getDevelopmentApiBaseUrl() : PRODUCTION_API_BASE_URL),
);

export const FILE_BASE_URL = removeApiPath(API_BASE_URL);
