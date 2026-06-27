const mongoose = require("mongoose");

const createConsultationService = require("../services/consultation/create-consultation.service");
const getConsultationByIdService = require("../services/consultation/get-consultation-by-id.service");
const getConsultationByAppointmentService = require("../services/consultation/get-consultation-by-appointment.service");
const getConsultationsService = require("../services/consultation/get-consultations.service");
const getPrescriptionDataService = require("../services/consultation/download-prescription-pdf.service");

const generatePrescriptionPdf = require("../utils/generatePrescriptionPdf");
const asyncHandler = require("../utils/asyncHandler");
const ERR = require("../utils/errors");
const { getPagination, getPaginationMeta } = require("../utils/pagination");

const createConsultation = asyncHandler(async (req, res) => {
  const consultation = await createConsultationService(req.body);

  return res.status(201).json({
    success: true,
    message: "Consultation created successfully",
    data: consultation,
  });
});
const getConsultationByAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    throw ERR.invalidAppointmentId();
  }

  const consultation = await getConsultationByAppointmentService(appointmentId);

  return res.status(200).json({
    success: true,
    message: "Consultation retrieved successfully",
    data: consultation,
  });
});
const getConsultations = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort, search, status, fromDate, toDate } =
    getPagination(req.query, {
      allowedSortFields: ["createdAt", "updatedAt", "status"],
      defaultSort: { createdAt: -1 },
    });

  const { consultations, total } = await getConsultationsService({
    skip,
    limit,
    sort,
    search,
    status,
    fromDate,
    toDate,
  });

  return res.status(200).json({
    success: true,
    message: "Consultations retrieved successfully",
    data: consultations,
    pagination: getPaginationMeta({
      page,
      limit,
      total,
    }),
  });
});

const downloadPrescriptionPdf = asyncHandler(async (req, res) => {
  const { consultationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(consultationId)) {
    throw ERR.invalidConsultationId();
  }

  const consultation = await getPrescriptionDataService(consultationId);

  generatePrescriptionPdf(consultation, res);
});

const getConsultationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ERR.invalidConsultationId();
  }

  const consultation = await getConsultationByIdService(id);

  return res.status(200).json({
    success: true,
    message: "Consultation retrieved successfully",
    data: consultation,
  });
});

module.exports = {
  createConsultation,
  getConsultationById,
  getConsultationByAppointment,
  getConsultations,
  downloadPrescriptionPdf,
};
