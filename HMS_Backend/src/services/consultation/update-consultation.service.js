const Consultation = require("../../models/Consultation");
const ApiError = require("../../utils/ApiError");

const updateConsultationService = async (consultationId, data, updatedBy) => {
  const consultation = await Consultation.findOne({
    _id: consultationId,
    isDeleted: false,
  });

  if (!consultation) {
    throw new ApiError(404, "Consultation not found", "CONSULTATION_NOT_FOUND");
  }

  Object.assign(consultation, data);

  consultation.updatedBy = updatedBy;

  await consultation.save();

  return consultation;
};

module.exports = updateConsultationService;
