const Consultation = require("../../models/Consultation");
const ERR = require("../../utils/errors");
const getConsultationByAppointmentService = async (appointmentId) => {
  const consultation = await Consultation.findOne({
    appointmentId,
  })
    .populate("patientId")
    .populate("doctorEmployeeId")
    .populate("appointmentId");

  if (!consultation) {
throw ERR.consultationNotFound();  }

  return consultation;
};

module.exports = getConsultationByAppointmentService;
