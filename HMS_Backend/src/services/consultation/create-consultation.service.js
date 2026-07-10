const Consultation = require("../../models/Consultation");

const Appointment = require("../../models/Appointment");

const STATUS = require("../../constants/status");
const ApiError = require("../../utils/ApiError");

const createConsultationService = async (data, createdBy) => {
  const {
    appointmentId,
    diagnosis,
    symptoms,
    doctorNotes,
    vitals,
    prescriptions,
  } = data;

  const existingConsultation = await Consultation.findOne({
    appointmentId,
    isDeleted: false,
  });

  if (existingConsultation) {
    throw new ApiError(
      409,
      "Consultation already exists",
      "CONSULTATION_ALREADY_EXISTS",
    );
  }

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    isDeleted: false,
  });

  if (!appointment) {
    throw new ApiError(404, "Appointment not found", "APPOINTMENT_NOT_FOUND");
  }

  const consultation = await Consultation.create({
    appointmentId,
    patientId: appointment.patientId,
    doctorEmployeeId: appointment.doctorEmployeeId,
    diagnosis,
    symptoms,
    doctorNotes,
    vitals,
    prescriptions,
    status: STATUS.COMPLETED,
    createdBy,
    updatedBy: createdBy,
  });
  appointment.status = STATUS.COMPLETED;

  appointment.updatedBy = createdBy;

  await appointment.save();

  return consultation;
};

module.exports = createConsultationService;
