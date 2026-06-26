import apiClient from "../config/appClient";
import { DoctorSpecializations } from "../types/doctor.types";


export const getDoctors = async (
  page = 1,
  limit = 10,
  search = '',
  specialization = ''
) => {
  const response = await apiClient.get('/doctors/list', {
    params: {
      page,
      limit,
      search: search.trim(),
      specialization:
      specialization === 'All' ? '' : specialization,
    },
  });

  return response.data;
};
export const getDoctorSpecializations = async (): Promise<DoctorSpecializations> => {  // ← add return type
  const response = await apiClient.get('/doctors/specializations');

  return response.data.data || [];
};