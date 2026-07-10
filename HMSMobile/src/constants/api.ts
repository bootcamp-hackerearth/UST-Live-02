const DEFAULT_API_BASE_URL = "https://bootstrap-hms.duckdns.org/api";

const configuredApiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

export const API_BASE_URL =
  !__DEV__ && new URL(configuredApiBaseUrl).protocol !== "https:"
    ? DEFAULT_API_BASE_URL
    : configuredApiBaseUrl;
export const FILE_BASE_URL = API_BASE_URL.replace("/api", "");
