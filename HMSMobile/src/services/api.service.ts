import axiosDefault, { AxiosError, AxiosRequestConfig, create } from "axios";
import { API_BASE_URL } from "../constants/api";
import {
  getRefreshToken,
  getToken,
  removeTokens,
  saveTokens,
} from "../storage/token.storage";
import { resetToLogin } from "../navigation/RootNavigation";
import { clearServiceCaches } from "./cache.service";
import { queryClient } from "./query-client";
import { showToast } from "./toast.service";
import { setOfflineStatus } from "./offline-status.service";
import { logger } from "../utils/logger";
import {
  cacheGetResponse,
  enqueueOfflineRequest,
  getCachedResponse,
  getOfflineQueue,
  isAuthUrl,
  isFormDataBody,
  isMutationMethod,
  setOfflineQueue,
} from "./offline.service";

interface RetryAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const api = create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

const shouldRefreshToken = (config?: RetryAxiosRequestConfig) => {
  if (!config || config._retry || config.url?.includes("/auth/")) {
    return false;
  }

  return true;
};

let isRefreshing = false;
let isReplayingOfflineQueue = false;

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
  queryClient.clear();

  await removeTokens();

  setTimeout(() => {
    resetToLogin();
  }, 0);
};

const replayOfflineQueue = async () => {
  if (isReplayingOfflineQueue) {
    return;
  }

  const queue = await getOfflineQueue();

  if (!queue.length) {
    return;
  }

  isReplayingOfflineQueue = true;

  try {
    const remaining = [...queue];

    while (remaining.length) {
      const nextRequest = remaining[0];

      await api.request({
        method: nextRequest.method,
        url: nextRequest.url,
        params: nextRequest.params,
        data: nextRequest.data,
      });

      remaining.shift();
      await setOfflineQueue(remaining);
    }

    showToast("Offline changes synced successfully.", "success");
    logger.info("Offline queue synced", { syncedRequests: queue.length });
  } catch (error) {
    logger.warn("Offline queue sync failed", { error });
    showToast("Some offline changes could not sync yet.", "error");
  } finally {
    isReplayingOfflineQueue = false;
  }
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
  async (response) => {
    setOfflineStatus(false);

    await cacheGetResponse(response.config, response.data);

    if (!isReplayingOfflineQueue) {
      replayOfflineQueue().catch((replayError) => {
        logger.warn("Offline queue replay failed", { error: replayError });
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryAxiosRequestConfig;

    if (!error.response) {
      setOfflineStatus(true);
      logger.warn("Network request failed while offline", {
        method: originalRequest?.method,
        url: originalRequest?.url,
      });
      showToast(
        "You appear to be offline. Please check your connection.",
        "error",
      );

      const cached = await getCachedResponse(originalRequest);

      if (cached) {
        showToast("Offline mode", "info");

        return {
          data: cached,
          status: 200,
          statusText: "OK",
          headers: {},
          config: originalRequest,
        };
      }

      if (
        originalRequest &&
        isMutationMethod(originalRequest.method) &&
        !isAuthUrl(originalRequest.url) &&
        !isFormDataBody(originalRequest.data)
      ) {
        await enqueueOfflineRequest(originalRequest);
        showToast(
          "Offline change queued. It will sync automatically.",
          "success",
        );

        return {
          data: {
            success: true,
            statusCode: 202,
            message: "Offline request queued",
            data: null,
          },
          status: 202,
          statusText: "Accepted",
          headers: {},
          config: originalRequest,
        };
      }
    }

    if (originalRequest?.url?.includes("/auth/refresh-token")) {
      logger.warn("Refresh token request failed");
      await logoutUser();

      throw error;
    }

    if (error.response?.status === 401 && shouldRefreshToken(originalRequest)) {
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
          await logoutUser();

          throw error;
        }

        const response = await axiosDefault.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {
            refreshToken,
          },
          {
            withCredentials: true,
          },
        );

        const newAccessToken = response.data.data.accessToken;
        const newRefreshToken = response.data.data.refreshToken;

        await saveTokens(newAccessToken, newRefreshToken);

        processQueue(null, newAccessToken);

        originalRequest.headers = originalRequest.headers ?? {};

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        logger.warn("Token refresh failed", { error: refreshError });
        processQueue(refreshError);

        await logoutUser();

        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    logger.error("API request failed", error, {
      method: originalRequest?.method,
      url: originalRequest?.url,
      status: error.response?.status,
    });

    throw error;
  },
);

export default api;
