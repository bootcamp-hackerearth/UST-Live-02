import axiosDefault, { AxiosError, AxiosRequestConfig, create } from "axios";

import { API_BASE_URL } from "../constants/api";

import {
  getToken,
  getRefreshToken,
  saveToken,
  removeTokens,
} from "../storage/token.storage";

import { resetToLogin } from "../navigation/RootNavigation";
import { clearServiceCaches } from "./cache.service";

interface RetryAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const api = create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

let isRefreshing = false;

let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token?: string) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });

  failedQueue = [];
};

const logoutUser = async () => {
  clearServiceCaches();

  await removeTokens();

  setTimeout(() => {
    resetToLogin();
  }, 0);
};

api.interceptors.request.use(async (config) => {
  const token = await getToken();

  if (token) {
    config.headers = config.headers ?? {};

    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryAxiosRequestConfig;

    if (originalRequest?.url?.includes("/auth/refresh-token")) {
      await logoutUser();

      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
          });
        }).then((token) => {
          originalRequest.headers = originalRequest.headers ?? {};

          originalRequest.headers.Authorization = `Bearer ${token}`;

          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          throw error;
        }

        const response = await axiosDefault.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {
            refreshToken,
          },
        );

        const newAccessToken = response.data.data.accessToken;

        await saveToken(newAccessToken);

        processQueue(null, newAccessToken);

        originalRequest.headers = originalRequest.headers ?? {};

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        await logoutUser();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
