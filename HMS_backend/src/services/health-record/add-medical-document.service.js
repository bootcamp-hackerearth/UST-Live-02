const Patient = require("../../models/Patient");

const ApiError = require("../../utils/ApiError");

const addMedicalDocumentService = async (patientId, data, file, uploadedBy) => {
  const patient = await Patient.findOne({
    _id: patientId,
    isDeleted: false,
  });

  if (!patient) {
    throw new ApiError(404, "Patient not found", "PATIENT_NOT_FOUND");
  }

  if (!file) {
    throw new ApiError(400, "Document file is required", "VALIDATION_ERROR");
  }

  patient.medicalDocuments.push({
    ...data,
    documentUrl: `/uploads/medical-documents/${file.filename}`,
    uploadedBy,
    uploadedAt: new Date(),
    updatedBy: null,
    updatedAt: null,
    isDeleted: false,
    deletedBy: null,
    deletedAt: null,
  });

  patient.updatedBy = uploadedBy;

  await patient.save();

  return patient.medicalDocuments.at(-1);
};

module.exports = addMedicalDocumentService;
