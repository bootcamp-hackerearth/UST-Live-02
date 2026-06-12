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