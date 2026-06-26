import { API_BASE_URL } from "../constants/api";

export const getFileUrl = (filePath?: string) => {
  if (!filePath) {
    return "";
  }

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  return `${API_BASE_URL.replace("/api", "")}${filePath}`;
};
