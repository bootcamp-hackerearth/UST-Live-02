/**
 * @file apiClient.ts
 * @overview Centralized Axios client configuration for API communication.
 * @description This file sets up a single Axios instance with a base URL, timeout, and headers.
 * It attaches interceptors for handling authentication tokens (`AuthInterceptor`) and for global
 * error handling and token refreshing (`ErrorInterceptor`). All other service files use this client.
 * @connections
 * - All services (`authService`, `appointmentService`, etc.) -> import and use `apiClient` to make HTTP requests.
 * - `apiClient` -> `attachAuthInterceptor` -> Request runs through `AuthInterceptor` first.
 * - `apiClient` -> `attachErrorInterceptor` -> Response runs through `ErrorInterceptor` for centralized error handling.
 */

import axios from "axios";
import Toast from "react-native-toast-message";
import { attachAuthInterceptor } from "../interceptors/AuthInterceptor";
import { attachErrorInterceptor } from "../interceptors/ErrorInterceptor";

const apiClient = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
    withCredentials: true,
});
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (!error.response) {
            Toast.show({
                type: "error",
                text1: "Server Unreachable",
                text2: "Please check your internet connection and try again.",
                position: "bottom"
            });
        } else if (error.response.status >= 500) {
            Toast.show({
                type: "error",
                text1: "Server Error",
                text2: "Our servers are experiencing issues. Please try again later.",
            });
        }
        return Promise.reject(error);
    }
);

attachAuthInterceptor(apiClient);
attachErrorInterceptor(apiClient);

export default apiClient;