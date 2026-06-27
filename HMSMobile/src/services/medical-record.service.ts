import { apiClient } from "./api-client";

type ListParams = {
  page?: number;
  limit?: number;
};

export const getMyPrescriptions = async (params: ListParams = {}) => {
  return apiClient.get("/medical-records/prescriptions/my", {
    params,
  });
};

export const getPrescriptionById = async (id: string) => {
  return apiClient.get(`/medical-records/prescriptions/${id}`);
};

export const getMyLabReports = async (params: ListParams = {}) => {
  return apiClient.get("/medical-records/lab-reports/my", {
    params,
  });
};

export const getMyHealthRecords = async (params: ListParams = {}) => {
  return apiClient.get("/medical-records/health-records/my", {
    params,
  });
};

export const getHealthRecordById = async (id: string) => {
  return apiClient.get(`/medical-records/health-records/${id}`);
};
