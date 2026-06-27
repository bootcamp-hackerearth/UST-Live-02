import apiClient from '../config/appClient';
import { RegisterPatientPayload } from '../types/register.types';

export const registerPatient = async (payload: RegisterPatientPayload) => {
  const response = await apiClient.post('/patients/register', payload);
  return response.data;
};