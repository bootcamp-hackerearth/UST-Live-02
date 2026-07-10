/**
 * @file appointmentService.ts
 * @overview A service layer for all appointment-related API calls.
 * @description This file abstracts the API endpoints for appointments. It provides functions for fetching doctors,
 * checking available slots, creating, updating, and fetching patient appointments.
 * @connections
 * - Screens (`HomeScreen`, `ViewAppointmentsScreen`) and Hooks (`useAppointmentData`) -> Call functions on `appointmentService`.
 * - `appointmentService` functions -> Use `apiClient` to make the actual HTTP requests to the backend appointment endpoints.
 */

import apiClient from "./apiClient";

export const appointmentService = {
    getDoctors: async () => {
        const response = await apiClient.get("/api/appointment/doctors");
        return response.data;
    },

    getAvailableSlots: async (doctorId: string, date: string) => {
        const response = await apiClient.get(`/api/appointment/slots?doctorId=${doctorId}&date=${date}`);
        return response.data;
    },

    createAppointment: async (payload: any) => {
        const response = await apiClient.post("/api/appointment/create", payload);
        return response.data;
    },

    updateAppointment: async (appointmentCode: string, payload: any) => {
        const response = await apiClient.put(`/api/appointment/${appointmentCode}`, payload);
        return response.data;
    },

    getMyAppointments: async () => {
        const response = await apiClient.get("/api/appointment/my-appointments");
        return response.data;
    },

    cancelAppointment: async (appointmentCode: string, payload: any) => {
        const response = await apiClient.put(`/api/appointment/${appointmentCode}`, payload);
        return response.data;
    }
};