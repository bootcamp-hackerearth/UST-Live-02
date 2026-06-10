const mongoose = require("mongoose");

const createConsultationService = require("../services/consultation/create-consultation.service");
const getConsultationByIdService = require("../services/consultation/get-consultation-by-id.service");
const getConsultationByAppointmentService = require("../services/consultation/get-consultation-by-appointment.service");
const updateConsultationService = require("../services/consultation/update-consultation.service");
const getConsultationsService = require("../services/consultation/get-consultations.service");
const getPrescriptionDataService = require("../services/consultation/download-prescription-pdf.service");

const generatePrescriptionPdf = require("../utils/generatePrescriptionPdf");

const createConsultation = async (req, res) => {
  try {
    const consultation = await createConsultationService(req.body);

    return res.status(201).json({
      success: true,
      message: "Consultation created successfully",
      data: consultation,
    });
  } catch (error) {
    console.error("CREATE CONSULTATION ERROR:", error);

    if (error.message === "Consultation already exists") {
      return res.status(409).json({
        success: false,
        message: "A consultation already exists for this appointment",
      });
    }

    if (error.message === "Appointment not found") {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create consultation",
    });
  }
};

const getConsultationByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const consultation =
      await getConsultationByAppointmentService(appointmentId);

    return res.status(200).json({
      success: true,
      message: "Consultation retrieved successfully",
      data: consultation,
    });
  } catch (error) {
    console.error("GET CONSULTATION BY APPOINTMENT ERROR:", error);

    if (error.message === "Consultation not found") {
      return res.status(404).json({
        success: false,
        message: "No consultation found for the provided appointment",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve consultation details",
    });
  }
};

const updateConsultation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid consultation ID",
      });
    }

    const consultation = await updateConsultationService(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Consultation updated successfully",
      data: consultation,
    });
  } catch (error) {
    console.error("UPDATE CONSULTATION ERROR:", error);

    if (error.message === "Consultation not found") {
      return res.status(404).json({
        success: false,
        message: "Consultation not found",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update consultation",
    });
  }
};

const getConsultations = async (req, res) => {
  try {
    const consultations = await getConsultationsService();

    return res.status(200).json({
      success: true,
      message: "Consultations retrieved successfully",
      data: consultations,
    });
  } catch (error) {
    console.error("GET CONSULTATIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve consultations",
    });
  }
};

const downloadPrescriptionPdf = async (req, res) => {
  try {
    const { consultationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(consultationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid consultation ID",
      });
    }

    const consultation = await getPrescriptionDataService(consultationId);

    generatePrescriptionPdf(consultation, res);
  } catch (error) {
    console.error("DOWNLOAD PRESCRIPTION PDF ERROR:", error);

    if (error.message === "Consultation not found") {
      return res.status(404).json({
        success: false,
        message: "Consultation not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to generate prescription PDF",
    });
  }
};

const getConsultationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid consultation ID",
      });
    }

    const consultation = await getConsultationByIdService(id);

    return res.status(200).json({
      success: true,
      message: "Consultation retrieved successfully",
      data: consultation,
    });
  } catch (error) {
    console.error("GET CONSULTATION BY ID ERROR:", error);

    if (error.message === "Consultation not found") {
      return res.status(404).json({
        success: false,
        message: "Consultation not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve consultation details",
    });
  }
};

module.exports = {
  createConsultation,
  getConsultationById,
  getConsultationByAppointment,
  updateConsultation,
  getConsultations,
  downloadPrescriptionPdf,
};