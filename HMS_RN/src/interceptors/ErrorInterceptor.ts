import { AxiosInstance } from "axios";
import * as SecureStore from "expo-secure-store";
import { resetToLogin } from "../navigation/RootNavigation";
import Toast from "react-native-toast-message";

export const attachErrorInterceptor = (client: AxiosInstance) => {
    client.interceptors.response.use(
        (response) => response,
        async (error) => {
            let customErrorMessage = "An unexpected network error occurred.";

            if (error.response) {
                const status = error.response.status;
                const serverMessage = error.response.data?.message;

                const isAuthRequest =
                    error.config?.url?.includes('login') ||
                    error.config?.url?.includes('signup');

                if (status === 401 || status === 403) {

                    if (isAuthRequest) {
                        customErrorMessage = serverMessage || "Authentication failed.";
                    }
                    else if (status === 403) {
                        customErrorMessage = serverMessage || "Forbidden: You do not have permission to perform this action.";
                    }
                    else {
                        await SecureStore.deleteItemAsync("patient_jwt");
                        await SecureStore.deleteItemAsync("patient_profile");
                        resetToLogin();
                        customErrorMessage = "Your session has expired. Please log in again.";
                    }

                } else if (status === 404) {
                    customErrorMessage = "Entity Not Found."
                } else if (status === 409) {
                    customErrorMessage = "Conflicting entity exists. Please check your data"
                } else if (status === 422) {
                    customErrorMessage = "Invalid request. Please check your data.";
                }
                else if (status >= 500) {
                    customErrorMessage = "The server is experiencing issues. Please try again later.";
                }
                else {
                    // Fallback
                    customErrorMessage = serverMessage || "Invalid request. Please check your data.";
                }
            } else if (error.request) {
                 Toast.show({
                                type: "error",
                                text1: "Server Error",
                                text2: "Our servers are experiencing issues. Please try again later.",
                            });
                customErrorMessage = "Could not connect to the server. Please check your internet connection.";
            }

            error.message = customErrorMessage;
            throw error;
        }
    );
};