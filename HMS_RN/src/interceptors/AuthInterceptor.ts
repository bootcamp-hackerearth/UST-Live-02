/**
 * @file AuthInterceptor.ts
 * @overview Axios request interceptor for attaching authorization tokens.
 * @description This interceptor automatically retrieves the JWT from secure storage and attaches it
 * as a 'Bearer' token to the `Authorization` header of all outgoing API requests.
 * @connections
 * - `apiClient.ts` -> Registers `attachAuthInterceptor`.
 * - Before any request is sent by `apiClient` -> This interceptor runs -> `SecureStore.getItemAsync("patient_jwt")` -> Modifies request `config.headers.Authorization`.
 */

import { AxiosInstance } from "axios";
import * as SecureStore from "expo-secure-store";

export const attachAuthInterceptor = (client: AxiosInstance) => {
    client.interceptors.request.use(
        async (config) => {
            try {
                const token = await SecureStore.getItemAsync("patient_jwt");
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.error("Error retrieving token:", error);
            }
            return config;
        },
        (error) => Promise.reject(error)
    );
};