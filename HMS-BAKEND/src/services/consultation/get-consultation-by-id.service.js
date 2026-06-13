const Consultation = require("../../models/consultation");

const getConsultationByIdService = async (id) => {
  const consultation = await Consultation.findById(id)
    .populate("patientId")
    .populate("doctorEmployeeId")
    .populate("appointmentId");

  if (!consultation) {
    throw new Error("Consultation not found");
  }

  return consultation;
};

module.exports = getConsultationByIdService;
