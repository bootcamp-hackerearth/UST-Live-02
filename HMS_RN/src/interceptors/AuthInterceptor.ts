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