import apiClient from '../config/appClient';

export const getPatientProfile = async () => {
  const response = await apiClient.get('/patients/profile');
  return response.data.data;
};
export const updatePatientProfile = async (payload: any) => {
  const response = await apiClient.put('/patients/profile', payload);
  return response.data.data;
};