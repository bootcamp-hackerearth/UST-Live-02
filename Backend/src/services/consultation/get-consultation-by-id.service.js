const Consultation = require("../../models/Consultation");
const ERR = require("../../utils/errors");

const getConsultationByIdService = async (id) => {
  const consultation = await Consultation.findById(id)
    .populate("patientId")
    .populate("doctorEmployeeId")
    .populate("appointmentId");

  if (!consultation) {
throw ERR.consultationNotFound(); }

  return consultation;
};

module.exports = getConsultationByIdService;
