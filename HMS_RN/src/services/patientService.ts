/**
 * @file patientService.ts
 * @overview A service layer for patient-specific API calls.
 * @description This file provides functions for interacting with the patient data endpoints,
 * such as updating a patient's profile.
 * @connections
 * - `ProfileScreen.tsx` -> Calls `patientService.updateProfile()`.
 * - `patientService` -> `apiClient.put` -> Backend patient endpoint.
 */

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