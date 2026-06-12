import apiClient from "./apiClient";
export const patientService = {
    updateProfile: async (uhid: string, payload: any) => {
        const response = await apiClient.put(`/api/patients/${uhid}`, payload);
        return response.data;
    },

    registerPatient: async (payload: any) => {
        const response = await apiClient.post("/api/patients/mobile-register", payload);
        return response.data;
    }
};