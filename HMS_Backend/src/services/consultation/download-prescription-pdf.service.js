const Consultation = require("../../models/consultation");

const getPrescriptionDataService = async (consultationId) => {
  const consultation = await Consultation.findById(consultationId)
    .populate("patientId")
    .populate("doctorEmployeeId")
    .populate("appointmentId");

  if (!consultation) {
    throw new Error("Consultation not found");
  }

  return consultation;
};

module.exports = getPrescriptionDataService;
