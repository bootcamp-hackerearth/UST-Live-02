const mongoose = require("mongoose");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const getHealthRecordsService = require("../services/health-record/get-health-records.service");
const getHealthRecordDetailsService = require("../services/health-record/get-health-record-details.service");
const addLabReportService = require("../services/health-record/add-lab-report.service");
const deleteLabReportService = require("../services/health-record/delete-lab-report.service");
const addMedicalDocumentService = require("../services/health-record/add-medical-document.service");
const deleteMedicalDocumentService = require("../services/health-record/delete-medical-document.service");
const updateLabReportService = require("../services/health-record/update-lab-report.service");
const updateMedicalDocumentService = require("../services/health-record/update-medical-document.service");
const { auditFromRequestSafe } = require("../services/audit-log/audit-log.service");

const validateObjectId = (id, message) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, message, "INVALID_ID");
  }
};

const getHealthRecords = asyncHandler(async (req, res) => {
  const result = await getHealthRecordsService(req.user, req.query);

  return res.status(200).json({
    ...new ApiResponse(
      200,
      "Health records retrieved successfully",
      result.data,
    ),
    meta: result.meta,
  });
});

const getHealthRecordDetails = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  validateObjectId(patientId, "Invalid patient ID");

  const result = await getHealthRecordDetailsService(
    patientId,
    req.user,
    req.query,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Health record retrieved successfully", result));
});

const addLabReport = asyncHandler(async (req, res) => {
  const result = await addLabReportService(
    req.params.patientId,
    req.body,
    req.file,
    req.user.userId,
  );

  auditFromRequestSafe(req, {
    action: "Lab Report Uploaded",
    module: "Health Record",
    entityId: result._id,
    entityType: "LabReport",
    details: {
      patientId: req.params.patientId,
      reportType: result.reportType,
      title: result.title,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Lab report added successfully", result));
});

const deleteLabReport = asyncHandler(async (req, res) => {
  const result = await deleteLabReportService(
    req.params.patientId,
    req.params.reportId,
    req.user.userId,
  );

  auditFromRequestSafe(req, {
    action: "Lab Report Deleted",
    module: "Health Record",
    entityId: req.params.reportId,
    entityType: "LabReport",
    details: {
      patientId: req.params.patientId,
    },
  });

  return res.status(200).json(new ApiResponse(200, result.message, result));
});

const addMedicalDocument = asyncHandler(async (req, res) => {
  const result = await addMedicalDocumentService(
    req.params.patientId,
    req.body,
    req.file,
    req.user.userId,
  );

  auditFromRequestSafe(req, {
    action: "Medical Document Uploaded",
    module: "Health Record",
    entityId: result._id,
    entityType: "MedicalDocument",
    details: {
      patientId: req.params.patientId,
      documentType: result.documentType,
      title: result.title,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Medical document added successfully", result));
});

const deleteMedicalDocument = asyncHandler(async (req, res) => {
  const result = await deleteMedicalDocumentService(
    req.params.patientId,
    req.params.documentId,
    req.user.userId,
  );

  auditFromRequestSafe(req, {
    action: "Medical Document Deleted",
    module: "Health Record",
    entityId: req.params.documentId,
    entityType: "MedicalDocument",
    details: {
      patientId: req.params.patientId,
    },
  });

  return res.status(200).json(new ApiResponse(200, result.message, result));
});

const updateLabReport = asyncHandler(async (req, res) => {
  const result = await updateLabReportService(
    req.params.patientId,
    req.params.reportId,
    req.body,
    req.file,
    req.user.userId,
  );

  auditFromRequestSafe(req, {
    action: "Lab Report Updated",
    module: "Health Record",
    entityId: result._id,
    entityType: "LabReport",
    details: {
      patientId: req.params.patientId,
      updatedFields: Object.keys(req.body),
      fileUpdated: Boolean(req.file),
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Lab report updated successfully", result));
});

const updateMedicalDocument = asyncHandler(async (req, res) => {
  const result = await updateMedicalDocumentService(
    req.params.patientId,
    req.params.documentId,
    req.body,
    req.file,
    req.user.userId,
  );

  auditFromRequestSafe(req, {
    action: "Medical Document Updated",
    module: "Health Record",
    entityId: result._id,
    entityType: "MedicalDocument",
    details: {
      patientId: req.params.patientId,
      updatedFields: Object.keys(req.body),
      fileUpdated: Boolean(req.file),
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Medical document updated successfully", result),
    );
});

module.exports = {
  getHealthRecords,
  getHealthRecordDetails,
  addLabReport,
  deleteLabReport,
  addMedicalDocument,
  deleteMedicalDocument,
  updateMedicalDocument,
  updateLabReport,
};
