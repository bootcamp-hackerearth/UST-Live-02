// src/services/appointment.service.ts

import apiClient from '../config/appClient';

import {
    Appointment,
    AppointmentDoctor,
    CreateAppointmentPayload,
} from '../types/appointment.types';

export const getMyAppointments = async (): Promise<Appointment[]> => {
    const response = await apiClient.get('/appointments/my-appointments');
    return response.data.data;
};

export const getDoctorsForAppointment = async (): Promise<AppointmentDoctor[]> => {
    const response = await apiClient.get('/doctors/list');
    return response.data.data;
};

export const createAppointment = async (
    payload: CreateAppointmentPayload
) => {
    const response = await apiClient.post('/appointments/create', payload);
    return response.data;
};


export const getAvailableSlots = async (
    doctorId: string,
    appointmentDate: string
): Promise<string[]> => {
    const response = await apiClient.get('/appointments/available-slots', {
        params: {
            doctorId,
            appointmentDate,
        },
    });

    return response.data.data.availableSlots;
};

export const cancelAppointment = async (
  appointmentId: string
): Promise<Appointment> => {
  const response = await apiClient.put(
    `/appointments/cancel/${appointmentId}`
  );

  return response.data.data;
};