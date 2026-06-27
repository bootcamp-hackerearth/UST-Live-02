const Patient = require("../../models/Patient");

const ApiError = require("../../utils/ApiError");

const addLabReportService = async (patientId, data, file, uploadedBy) => {
  const patient = await Patient.findOne({
    _id: patientId,
    isDeleted: false,
  });

  if (!patient) {
    throw new ApiError(404, "Patient not found", "PATIENT_NOT_FOUND");
  }

  if (!file) {
    throw new ApiError(400, "Report file is required", "VALIDATION_ERROR");
  }

  patient.labReports.push({
    ...data,

    documentUrl: `/uploads/lab-reports/${file.filename}`,

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

  return patient.labReports.at(-1);
};

module.exports = addLabReportService;
