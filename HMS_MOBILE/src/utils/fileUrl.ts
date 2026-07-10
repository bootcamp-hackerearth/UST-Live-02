import { FILE_BASE_URL } from "../constants/api";

export const getFileUrl = (path?: string) => {
  if (!path) {
    return null;
  }

  if (path.startsWith("http")) {
    return path;
  }

  return `${FILE_BASE_URL}/${path.replace(/^\/+/, "")}`;
};
