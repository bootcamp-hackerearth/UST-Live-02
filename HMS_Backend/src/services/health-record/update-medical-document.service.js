const fs = require("node:fs");
const path = require("node:path");

const Patient = require("../../models/Patient");
const ApiError = require("../../utils/ApiError");
const logger = require("../../utils/logger");

const updateMedicalDocumentService = async (
  patientId,
  documentId,
  data,
  file,
  updatedBy,
) => {
  const patient = await Patient.findOne({
    _id: patientId,
    isDeleted: false,
  });

  if (!patient) {
    throw new ApiError(404, "Patient not found", "PATIENT_NOT_FOUND");
  }

  const document = patient.medicalDocuments.id(documentId);

  if (!document) {
    throw new ApiError(404, "Medical document not found", "DOCUMENT_NOT_FOUND");
  }

  /* Update Metadata */
  document.title = data.title ?? document.title;

  document.documentType = data.documentType ?? document.documentType;

  document.hospitalName = data.hospitalName ?? document.hospitalName;

  document.doctorName = data.doctorName ?? document.doctorName;

  document.recordDate = data.recordDate ?? document.recordDate;

  document.notes = data.notes ?? document.notes;
  document.updatedBy = updatedBy;

  document.updatedAt = new Date();

  /* Replace File */
  if (file) {
    if (document.documentUrl) {
      const oldFilePath = path.join(
        process.cwd(),
        document.documentUrl.replace(/^\//, ""),
      );

      try {
        if (fs.existsSync(oldFilePath)) {
          await fs.promises.unlink(oldFilePath);
        }
      } catch (error) {
        logger.warn("Unable to delete old medical document file", {
          patientId,
          documentId,
          filePath: oldFilePath,
          error,
        });
      }
    }

    document.documentUrl = `/uploads/medical-documents/${file.filename}`;
  }

  patient.updatedBy = updatedBy;

  await patient.save();

  return document.toObject();
};

module.exports = updateMedicalDocumentService;
