const Consultation = require("../../models/consultation");

const updateConsultationService = async (consultationId, data) => {
  const consultation = await Consultation.findByIdAndUpdate(
    consultationId,
    data,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!consultation) {
    throw new Error("Consultation not found");
  }

  return consultation;
};

module.exports = updateConsultationService;
