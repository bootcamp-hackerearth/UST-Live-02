/**
 * @file ErrorInterceptor.ts
 * @overview Axios response interceptor for global error handling.
 * @description This interceptor catches API errors and standardizes them. It handles 401 unauthorized errors
 * by attempting to refresh the token. If token refresh fails or for other critical errors, it can reset the user
 * to the login screen. It also displays user-friendly error messages via toasts.
 * @connections
 * - `apiClient.ts` -> Registers `attachErrorInterceptor`.
 * - After an API response is received with an error -> This interceptor runs.
 * - On 401 error -> `handleTokenRefresh()` -> `apiClient.post('/api/auth/refresh')` -> On success, retries original request.
 * - On refresh failure -> `SecureStore.deleteItemAsync` -> `resetToLogin()` from `RootNavigation.ts` -> Navigates user to `LoginScreen`.
 */

import { AxiosInstance } from "axios";
import * as SecureStore from "expo-secure-store";
import { resetToLogin } from "../navigation/RootNavigation";
import Toast from "react-native-toast-message";

let isRefreshing = false;
let failedQueue: { resolve: any; reject: any }[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const getErrorMessage = (status: number, serverMessage: string | undefined, isAuthRequest: boolean): string => {
    if (status === 401 || status === 403) {
        if (isAuthRequest) return serverMessage || "Authentication failed.";
        if (status === 403) return serverMessage || "Forbidden: You do not have permission to perform this action.";
        return "Your session has expired. Please log in again.";
    }

    if (status === 404) return "Entity Not Found.";
    if (status === 409) return "Conflicting entity exists. Please check your data.";
    if (status === 422) return "Invalid request. Please check your data.";
    if (status >= 500) return "The server is experiencing issues. Please try again later.";

    return serverMessage || "Invalid request. Please check your data.";
};

const handleTokenRefresh = async (client: AxiosInstance, originalRequest: any) => {
    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        })
            .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return client(originalRequest);
            })
            .catch((err) => {
                throw err;
            });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
        const refreshResponse = await client.post('/api/auth/refresh');
        const newAccessToken = refreshResponse.data.accessToken;

        if (newAccessToken) {
            await SecureStore.setItemAsync("patient_jwt", newAccessToken);
            client.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            processQueue(null, newAccessToken);
            return client(originalRequest);
        }
    } catch (refreshError) {
        processQueue(refreshError, null);
        await SecureStore.deleteItemAsync("patient_jwt");
        await SecureStore.deleteItemAsync("patient_profile");
        resetToLogin();

        Toast.show({
            type: "error",
            text1: "Session Expired",
            text2: "Please log in again.",
        });

        throw refreshError;
    } finally {
        isRefreshing = false;
    }
};

export const attachErrorInterceptor = (client: AxiosInstance) => {
    client.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            if (error.response) {
                const status = error.response.status;
                const serverMessage = error.response.data?.message;

                const isAuthRequest =
                    originalRequest?.url?.includes('login') ||
                    originalRequest?.url?.includes('signup') ||
                    originalRequest?.url?.includes('refresh');
                if (status === 401 && !isAuthRequest && !originalRequest._retry) {
                    return handleTokenRefresh(client, originalRequest);
                }

                error.message = getErrorMessage(status, serverMessage, isAuthRequest);

            } else if (error.request) {
                error.message = "Could not connect to the server. Please check your internet connection.";
            }

            throw error;
        }
    );
};