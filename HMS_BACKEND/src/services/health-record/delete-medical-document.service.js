const fs = require("node:fs");
const path = require("node:path");

const Patient = require("../../models/Patient");
const ApiError = require("../../utils/ApiError");
const logger = require("../../utils/logger");

const deleteMedicalDocumentService = async (
  patientId,
  documentId,
  deletedBy,
) => {
  const patient = await Patient.findOne({
    _id: patientId,
    isDeleted: false,
  });

  if (!patient) {
    throw new ApiError(404, "Patient not found", "PATIENT_NOT_FOUND");
  }

  const index = patient.medicalDocuments.findIndex(
    (document) => document._id.toString() === documentId,
  );

  if (index === -1) {
    throw new ApiError(404, "Medical document not found", "DOCUMENT_NOT_FOUND");
  }

  const document = patient.medicalDocuments[index];

  /* Delete Physical File */
  if (document.documentUrl) {
    const filePath = path.join(
      process.cwd(),
      document.documentUrl.replace(/^\//, ""),
    );

    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      logger.warn("Unable to delete medical document file", {
        patientId,
        documentId,
        filePath,
        error,
      });
    }
  }

  /* Remove Document */
  document.isDeleted = true;
  document.deletedBy = deletedBy;
  document.deletedAt = new Date();

  patient.markModified("medicalDocuments");

  await patient.save();
  patient.markModified("medicalDocuments");

  await patient.save();

  return {
    message: "Medical document deleted successfully",
  };
};

module.exports = deleteMedicalDocumentService;
