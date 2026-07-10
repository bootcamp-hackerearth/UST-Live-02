const mongoose = require("mongoose");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createConsultationService = require("../services/consultation/create-consultation.service");
const getConsultationByIdService = require("../services/consultation/get-consultation-by-id.service");
const getConsultationByAppointmentService = require("../services/consultation/get-consultation-by-appointment.service");
const updateConsultationService = require("../services/consultation/update-consultation.service");
const getConsultationsService = require("../services/consultation/get-consultations.service");
const getPrescriptionDataService = require("../services/consultation/download-prescription-pdf.service");
const deleteConsultationService = require("../services/consultation/delete-consultation.service");
const generatePrescriptionPdf = require("../utils/generatePrescriptionPdf");
const { auditFromRequestSafe } = require("../services/audit-log/audit-log.service");

const validateObjectId = (id, message) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, message, "INVALID_ID");
  }
};

const createConsultation = asyncHandler(async (req, res) => {
  const consultation = await createConsultationService(
    req.body,
    req.user.userId,
  );

  auditFromRequestSafe(req, {
    action:
      consultation.status === "COMPLETED"
        ? "Consultation Completed"
        : "Consultation Created",
    module: "Consultation",
    entityId: consultation._id,
    entityType: "Consultation",
    details: {
      appointmentId: consultation.appointmentId,
      patientId: consultation.patientId,
      doctorEmployeeId: consultation.doctorEmployeeId,
      status: consultation.status,
    },
  });

  if (consultation.prescriptions?.length) {
    auditFromRequestSafe(req, {
      action: "Prescription Added",
      module: "Consultation",
      entityId: consultation._id,
      entityType: "Consultation",
      details: {
        appointmentId: consultation.appointmentId,
        prescriptionCount: consultation.prescriptions.length,
      },
    });
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, "Consultation created successfully", consultation),
    );
});

const getConsultationByAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  validateObjectId(appointmentId, "Invalid appointment ID");

  const consultation = await getConsultationByAppointmentService(appointmentId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Consultation retrieved successfully", consultation),
    );
});

const updateConsultation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateObjectId(id, "Invalid consultation ID");

  const consultation = await updateConsultationService(
    id,
    req.body,
    req.user.userId,
  );

  auditFromRequestSafe(req, {
    action:
      consultation.status === "COMPLETED"
        ? "Consultation Completed"
        : "Consultation Updated",
    module: "Consultation",
    entityId: consultation._id,
    entityType: "Consultation",
    details: {
      appointmentId: consultation.appointmentId,
      patientId: consultation.patientId,
      status: consultation.status,
      updatedFields: Object.keys(req.body),
    },
  });

  if (req.body.prescriptions?.length) {
    auditFromRequestSafe(req, {
      action: "Prescription Added",
      module: "Consultation",
      entityId: consultation._id,
      entityType: "Consultation",
      details: {
        appointmentId: consultation.appointmentId,
        prescriptionCount: req.body.prescriptions.length,
      },
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Consultation updated successfully", consultation),
    );
});

const getConsultations = asyncHandler(async (req, res) => {
  const result = await getConsultationsService(req.user, req.query);

  return res.status(200).json({
    ...new ApiResponse(
      200,
      "Consultations retrieved successfully",
      result.data,
    ),
    meta: result.meta,
  });
});

const downloadPrescriptionPdf = asyncHandler(async (req, res) => {
  const { consultationId } = req.params;

  validateObjectId(consultationId, "Invalid consultation ID");

  const consultation = await getPrescriptionDataService(consultationId);

  generatePrescriptionPdf(consultation, res);
});

const getConsultationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateObjectId(id, "Invalid consultation ID");

  const consultation = await getConsultationByIdService(id);

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Consultation retrieved successfully", consultation),
    );
});

const deleteConsultation = asyncHandler(async (req, res) => {
  const result = await deleteConsultationService(
    req.params.id,
    req.user.userId,
  );

  auditFromRequestSafe(req, {
    action: "Consultation Deleted",
    module: "Consultation",
    entityId: req.params.id,
    entityType: "Consultation",
  });

  return res.status(200).json(new ApiResponse(200, result.message, result));
});

module.exports = {
  createConsultation,
  getConsultationById,
  getConsultationByAppointment,
  updateConsultation,
  getConsultations,
  downloadPrescriptionPdf,
  deleteConsultation,
};
