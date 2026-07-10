import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosRequestConfig } from "axios";

type QueuedRequest = {
  id: string;
  method?: string;
  url?: string;
  params?: unknown;
  data?: unknown;
  createdAt: string;
};

const CACHE_PREFIX = "httpCache:";
const QUEUE_KEY = "offlineRequestQueue";
const CACHE_TTL_MS = 10 * 60 * 1000;

const getCacheKey = (method?: string, url?: string, params?: unknown) =>
  `${CACHE_PREFIX}${(method || "GET").toUpperCase()}:${url}:${JSON.stringify(params || {})}`;

const createQueueId = (
  queueLength: number,
  config: AxiosRequestConfig,
) =>
  [
    Date.now(),
    queueLength + 1,
    (config.method || "GET").toUpperCase(),
    config.url || "request",
  ].join("-");

export const isAuthUrl = (url?: string) => Boolean(url?.includes("/auth/"));

export const isFormDataBody = (data: unknown) =>
  typeof FormData !== "undefined" && data instanceof FormData;

export const isMutationMethod = (method?: string) =>
  ["POST", "PUT", "PATCH", "DELETE"].includes((method || "GET").toUpperCase());

export const cacheGetResponse = async (
  config: AxiosRequestConfig,
  responseData: unknown,
) => {
  if (
    (config.method || "GET").toUpperCase() !== "GET" ||
    isAuthUrl(config.url)
  ) {
    return;
  }

  await AsyncStorage.setItem(
    getCacheKey(config.method, config.url, config.params),
    JSON.stringify({
      createdAt: Date.now(),
      data: responseData,
    }),
  );
};

export const getCachedResponse = async (config?: AxiosRequestConfig) => {
  if (!config || (config.method || "GET").toUpperCase() !== "GET") {
    return null;
  }

  const cached = await AsyncStorage.getItem(
    getCacheKey(config.method, config.url, config.params),
  );

  if (!cached) {
    return null;
  }

  const parsed = JSON.parse(cached);

  if (Date.now() - parsed.createdAt > CACHE_TTL_MS) {
    return null;
  }

  return parsed.data;
};

export const enqueueOfflineRequest = async (config: AxiosRequestConfig) => {
  const stored = await AsyncStorage.getItem(QUEUE_KEY);
  const queue: QueuedRequest[] = stored ? JSON.parse(stored) : [];

  queue.push({
    id: createQueueId(queue.length, config),
    method: config.method,
    url: config.url,
    params: config.params,
    data: config.data,
    createdAt: new Date().toISOString(),
  });

  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const getOfflineQueue = async (): Promise<QueuedRequest[]> => {
  const stored = await AsyncStorage.getItem(QUEUE_KEY);

  return stored ? JSON.parse(stored) : [];
};

export const setOfflineQueue = async (queue: QueuedRequest[]) => {
  if (!queue.length) {
    await AsyncStorage.removeItem(QUEUE_KEY);
    return;
  }

  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};
