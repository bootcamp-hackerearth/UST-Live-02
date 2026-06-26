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
        limit = 10,
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