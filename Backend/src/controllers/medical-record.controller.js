const mongoose = require("mongoose");

const asyncHandler = require("../utils/asyncHandler");
const ERR = require("../utils/errors");
const getPrescriptionsService = require("../services/medical-record/get-prescriptions.service");
const getPrescriptionByIdService = require("../services/medical-record/get-prescription-by-id.service");
const getRecordPatientsService = require("../services/medical-record/get-record-patients.service");
const createHealthRecordService = require("../services/health-record/create-health-record.service");
const getHealthRecordsService = require("../services/health-record/get-health-records.service");
const getHealthRecordByIdService = require("../services/health-record/get-health-record-by-id.service");
const updateHealthRecordService = require("../services/health-record/update-health-record.service");
const deleteHealthRecordService = require("../services/health-record/delete-health-record.service");
const { getPagination, getPaginationMeta } = require("../utils/pagination");

const HEALTH_DOCUMENT_TYPES = [
  "PREVIOUS_DISCHARGE_SUMMARY",
  "LAB_REPORT",
  "SCAN_REPORT",
  "OTHER",
];

const throwValidationError = (errors) => {
  const error = ERR.validationFailed();
  error.errors = errors;
  throw error;
};

const validateHealthRecordCreate = (body, file) => {
  const errors = [];

  if (!body.patientId) {
    errors.push({ path: "patientId", msg: "Patient ID is required" });
  } else if (!mongoose.Types.ObjectId.isValid(body.patientId)) {
    errors.push({ path: "patientId", msg: "Invalid patient ID" });
  }

  if (!body.title?.trim()) {
    errors.push({ path: "title", msg: "Title is required" });
  }

  if (!HEALTH_DOCUMENT_TYPES.includes(body.documentType)) {
    errors.push({ path: "documentType", msg: "Invalid document type" });
  }

  if (!body.documentDate) {
    errors.push({ path: "documentDate", msg: "Document date is required" });
  }

  if (!file) {
    errors.push({ path: "documentFile", msg: "Document file is required" });
  }

  if (errors.length) {
    throwValidationError(errors);
  }
};

const validateHealthRecordUpdate = (body) => {
  const errors = [];

  if (body.title !== undefined && !body.title?.trim()) {
    errors.push({ path: "title", msg: "Title cannot be empty" });
  }

  if (
    body.documentType !== undefined &&
    !HEALTH_DOCUMENT_TYPES.includes(body.documentType)
  ) {
    errors.push({ path: "documentType", msg: "Invalid document type" });
  }

  if (errors.length) {
    throwValidationError(errors);
  }
};

const ensureLabReport = async (id, user) => {
  const record = await getHealthRecordByIdService(id, user);

  if (record.documentType !== "LAB_REPORT") {
    throw ERR.healthRecordNotFound();
  }

  return record;
};

const getRecordPatients = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort, search } = getPagination(req.query, {
    allowedSortFields: ["createdAt", "firstName", "lastName", "patientId"],
    defaultSort: { createdAt: -1 },
  });

  const { patients, total } = await getRecordPatientsService({
    user: req.user,
    skip,
    limit,
    sort,
    search,
  });

  return res.status(200).json({
    success: true,
    message: "Medical record patients retrieved successfully",
    data: patients,
    pagination: getPaginationMeta({
      page,
      limit,
      total,
    }),
  });
});

const getPrescriptions = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = getPagination(req.query, {
    allowedSortFields: ["createdAt"],
    defaultSort: { createdAt: -1 },
  });

  const { records: prescriptions, total } = await getPrescriptionsService({
    user: req.user,
    skip,
    limit,
    sort,
  });

  return res.status(200).json({
    success: true,
    message: "Prescriptions retrieved successfully",
    data: prescriptions,
    pagination: getPaginationMeta({
      page,
      limit,
      total,
    }),
  });
});

const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    throw ERR.invalidPatientId();
  }

  const { page, limit, skip, sort } = getPagination(req.query, {
    allowedSortFields: ["createdAt"],
    defaultSort: { createdAt: -1 },
  });

  const { records: prescriptions, total } = await getPrescriptionsService({
    user: req.user,
    patientId,
    skip,
    limit,
    sort,
  });

  return res.status(200).json({
    success: true,
    message: "Patient prescriptions retrieved successfully",
    data: prescriptions,
    pagination: getPaginationMeta({
      page,
      limit,
      total,
    }),
  });
});

const getMyPrescriptions = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = getPagination(req.query, {
    allowedSortFields: ["createdAt"],
    defaultSort: { createdAt: -1 },
  });

  const { records: prescriptions, total } = await getPrescriptionsService({
    user: req.user,
    skip,
    limit,
    sort,
  });

  return res.status(200).json({
    success: true,
    message: "My prescriptions retrieved successfully",
    data: prescriptions,
    pagination: getPaginationMeta({
      page,
      limit,
      total,
    }),
  });
});

const getPrescriptionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ERR.invalidConsultationId();
  }

  const prescription = await getPrescriptionByIdService(id, req.user);

  return res.status(200).json({
    success: true,
    message: "Prescription retrieved successfully",
    data: prescription,
  });
});

const getLabReports = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = getPagination(req.query, {
    allowedSortFields: ["createdAt", "documentDate", "title"],
    defaultSort: { createdAt: -1 },
  });

  const { records, total } = await getHealthRecordsService({
    user: req.user,
    documentType: "LAB_REPORT",
    skip,
    limit,
    sort,
  });

  return res.status(200).json({
    success: true,
    message: "Lab reports retrieved successfully",
    data: records,
    pagination: getPaginationMeta({
      page,
      limit,
      total,
    }),
  });
});

const getPatientLabReports = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    throw ERR.invalidPatientId();
  }

  const { page, limit, skip, sort } = getPagination(req.query, {
    allowedSortFields: ["createdAt", "documentDate", "title"],
    defaultSort: { createdAt: -1 },
  });

  const { records, total } = await getHealthRecordsService({
    patientId,
    user: req.user,
    documentType: "LAB_REPORT",
    skip,
    limit,
    sort,
  });

  return res.status(200).json({
    success: true,
    message: "Patient lab reports retrieved successfully",
    data: records,
    pagination: getPaginationMeta({
      page,
      limit,
      total,
    }),
  });
});

const createLabReport = asyncHandler(async (req, res) => {
  req.body = req.body || {};
  req.body.documentType = "LAB_REPORT";

  validateHealthRecordCreate(req.body, req.file);

  const record = await createHealthRecordService(req.body, req.file, req.user);

  return res.status(201).json({
    success: true,
    message: "Lab report created successfully",
    data: record,
  });
});

const updateLabReport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ERR.invalidHealthRecordId();
  }

  await ensureLabReport(id, req.user);

  req.body = req.body || {};
  req.body.documentType = "LAB_REPORT";
  validateHealthRecordUpdate(req.body);

  const record = await updateHealthRecordService(
    id,
    req.body,
    req.file,
    req.user
  );

  return res.status(200).json({
    success: true,
    message: "Lab report updated successfully",
    data: record,
  });
});

const deleteLabReport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ERR.invalidHealthRecordId();
  }

  await ensureLabReport(id, req.user);
  await deleteHealthRecordService(id, req.user.userId);

  return res.status(200).json({
    success: true,
    message: "Lab report deleted successfully",
  });
});

const createHealthRecord = asyncHandler(async (req, res) => {
  validateHealthRecordCreate(req.body, req.file);

  const record = await createHealthRecordService(req.body, req.file, req.user);

  return res.status(201).json({
    success: true,
    message: "Health record created successfully",
    data: record,
  });
});

const getHealthRecords = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = getPagination(req.query, {
    allowedSortFields: ["createdAt", "documentDate", "title"],
    defaultSort: { createdAt: -1 },
  });

  const { records, total } = await getHealthRecordsService({
    user: req.user,
    excludeDocumentType: "LAB_REPORT",
    skip,
    limit,
    sort,
  });

  return res.status(200).json({
    success: true,
    message: "Health records retrieved successfully",
    data: records,
    pagination: getPaginationMeta({
      page,
      limit,
      total,
    }),
  });
});

const getPatientHealthRecords = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    throw ERR.invalidPatientId();
  }

  const { page, limit, skip, sort } = getPagination(req.query, {
    allowedSortFields: ["createdAt", "documentDate", "title"],
    defaultSort: { createdAt: -1 },
  });

  const { records, total } = await getHealthRecordsService({
    patientId,
    user: req.user,
    excludeDocumentType: "LAB_REPORT",
    skip,
    limit,
    sort,
  });

  return res.status(200).json({
    success: true,
    message: "Patient health records retrieved successfully",
    data: records,
    pagination: getPaginationMeta({
      page,
      limit,
      total,
    }),
  });
});

const getMyHealthRecords = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = getPagination(req.query, {
    allowedSortFields: ["createdAt", "documentDate", "title"],
    defaultSort: { createdAt: -1 },
  });

  const { records, total } = await getHealthRecordsService({
    user: req.user,
    excludeDocumentType: "LAB_REPORT",
    skip,
    limit,
    sort,
  });

  return res.status(200).json({
    success: true,
    message: "My health records retrieved successfully",
    data: records,
    pagination: getPaginationMeta({
      page,
      limit,
      total,
    }),
  });
});

const getHealthRecordById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ERR.invalidHealthRecordId();
  }

  const record = await getHealthRecordByIdService(id, req.user);

  return res.status(200).json({
    success: true,
    message: "Health record retrieved successfully",
    data: record,
  });
});

const updateHealthRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ERR.invalidHealthRecordId();
  }

  validateHealthRecordUpdate(req.body);

  const record = await updateHealthRecordService(
    id,
    req.body,
    req.file,
    req.user
  );

  return res.status(200).json({
    success: true,
    message: "Health record updated successfully",
    data: record,
  });
});

const deleteHealthRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ERR.invalidHealthRecordId();
  }

  await deleteHealthRecordService(id, req.user.userId);

  return res.status(200).json({
    success: true,
    message: "Health record deleted successfully",
  });
});

module.exports = {
  getRecordPatients,
  getPrescriptions,
  getPatientPrescriptions,
  getMyPrescriptions,
  getPrescriptionById,
  getLabReports,
  getPatientLabReports,
  createLabReport,
  updateLabReport,
  deleteLabReport,
  createHealthRecord,
  getHealthRecords,
  getPatientHealthRecords,
  getMyHealthRecords,
  getHealthRecordById,
  updateHealthRecord,
  deleteHealthRecord,
};
