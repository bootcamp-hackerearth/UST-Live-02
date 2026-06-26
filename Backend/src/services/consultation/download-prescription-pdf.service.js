const Consultation = require("../../models/Consultation");
const ERR = require("../../utils/errors");

const getPrescriptionDataService = async (consultationId) => {
  const consultation = await Consultation.findById(consultationId)
    .populate("patientId")
    .populate("doctorEmployeeId")
    .populate("appointmentId");

  if (!consultation) {
throw ERR.consultationNotFound();  }

  return consultation;
};

module.exports = getPrescriptionDataService;
