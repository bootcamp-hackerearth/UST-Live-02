import axiosClient, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

import { API_BASE_URL } from "../constants/api";
import {
  getRefreshToken,
  getToken,
  removeTokens,
  saveToken,
} from "../storage/token.storage";

type RetryRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

// eslint-disable-next-line import/no-named-as-default-member
export const apiClient = axiosClient.create({
  baseURL: API_BASE_URL,
});

const refreshAccessToken = async () => {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    await removeTokens();
    return null;
  }

  const response = await axiosClient.post(`${API_BASE_URL}/auth/refresh-token`, {
    refreshToken,
  });

  const newAccessToken = response.data?.data?.accessToken;

  if (!newAccessToken) {
    await removeTokens();
    return null;
  }

  await saveToken(newAccessToken);

  return newAccessToken;
};

apiClient.interceptors.request.use(async (config) => {
  const accessToken = await getToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh-token")
    ) {
      return Promise.reject(error);
    }

    try {
      originalRequest._retry = true;

      refreshPromise = refreshPromise || refreshAccessToken();
      const newAccessToken = await refreshPromise;
      refreshPromise = null;

      if (!newAccessToken) {
        return Promise.reject(error);
      }

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      refreshPromise = null;
      await removeTokens();
      return Promise.reject(refreshError);
    }
  },
);
