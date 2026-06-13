const Consultation = require("../../models/consultation");
const Appointment = require("../../models/appointment");

const createConsultationService = async (data) => {
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
  });

  if (existingConsultation) {
    throw new Error("Consultation already exists");
  }

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new Error("Appointment not found");
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
  });

  await Appointment.findByIdAndUpdate(appointmentId, {
    status: "COMPLETED",
  });

  return consultation;
};

module.exports = createConsultationService;
