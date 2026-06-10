const Consultation = require("../../models/consultation");

const getConsultationByAppointmentService = async (appointmentId) => {
  const consultation = await Consultation.findOne({
    appointmentId,
  })
    .populate("patientId")
    .populate("doctorEmployeeId")
    .populate("appointmentId");

  if (!consultation) {
    throw new Error("Consultation not found");
  }

  return consultation;
};

module.exports = getConsultationByAppointmentService;
