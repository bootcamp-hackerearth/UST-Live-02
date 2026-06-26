import api from "./interceptor.service";

// get medical records
export const getMedicalRecords = async (page: number, patientId: string) => {
  const response = await api.get("/medicalRecord/getMedicalRecords", {
    params: {
      page: page,
      limit: 5,
      patientId: patientId,
      isClientApp: true,
    },
  });
  return response;
};
