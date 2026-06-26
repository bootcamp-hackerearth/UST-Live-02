import apiClient from "./apiClient";
import { LoginResponse } from "../features/auth/types";
import * as SecureStore from "expo-secure-store";

export const authService = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>("/api/auth/login", {
            email,
            password,
            clientType: "MOBILE",
        });

        const data = response.data;

        if (!data.accessToken) {
            throw new Error("Server did not return a token.");
        }

        if (data.user?.profile) {
            await SecureStore.setItemAsync("patient_jwt", data.accessToken);
            await SecureStore.setItemAsync(
                "patient_profile",
                JSON.stringify(data.user.profile)
            );
        }
        return data;
    },

    register: async (payload: any) => {
        const response = await apiClient.post("/api/patients/mobile-register", payload);
        return response.data;
    },

    logout: async () => {
        try {
            await apiClient.post("/api/auth/logout");
        } catch (error) {
            console.error("Backend logout failed, proceeding with local clear.", error);
        } finally {
            await SecureStore.deleteItemAsync("patient_jwt");
            await SecureStore.deleteItemAsync("patient_profile");
        }
    }
};