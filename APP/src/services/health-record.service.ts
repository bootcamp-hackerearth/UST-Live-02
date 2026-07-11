import apiClient from '../config/appClient';

import {
  HealthRecordListResponse,
  HealthRecordSingleResponse,
} from '../types/health-record.types';

export const getMyHealthRecords = async (
  page = 1,
  limit = 10
): Promise<HealthRecordListResponse> => {
  const response = await apiClient.get('/health-records/list', {
    params: {
      page,
      limit,
      search: '',
    },
  });

  return response.data;
};

export const getHealthRecordById = async (
  healthRecordId: string
): Promise<HealthRecordSingleResponse> => {
  const response = await apiClient.get(
    `/health-records/${healthRecordId}`
  );

  return response.data;
};