/**
 * @file recordService.ts
 * @overview A service layer for medical record-related API calls.
 * @description This file abstracts the API endpoints for fetching a patient's medical records,
 * supporting pagination and filtering.
 * @connections
 * - `MedicalRecordsScreen.tsx` -> Calls `recordService.getMyRecords()`.
 * - `recordService` -> Constructs URL with query parameters -> `apiClient.get` -> Backend records endpoint.
 */

import apiClient from "./apiClient";
import { MedicalRecord } from "../features/auth/types";
import { RecordFilters } from "../components/MedicalRecordFilter";

interface PaginatedRecordsResponse {
    data: MedicalRecord[];
    pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
    };
}

export const recordService = {
    getMyRecords: async (
        page = 1,
        limit = 5,
        filters: Partial<RecordFilters> = {},
    ): Promise<PaginatedRecordsResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (filters.appointmentId) {
            params.append("search", filters.appointmentId);
        }
        if (filters.doctorId) {
            params.append("doctorId", filters.doctorId);
        }
        if (filters.date) {
            params.append("date", filters.date.toISOString().split("T")[0]);
        }

        const response = await apiClient.get(`/api/records/getPatientRecords?${params.toString()}`);
        return response.data;
    },

    getRecordById: async (id: string): Promise<MedicalRecord> => {
        const response = await apiClient.get(`/api/records/getPatientRecords/${id}`);
        return response.data.data;
    }
};