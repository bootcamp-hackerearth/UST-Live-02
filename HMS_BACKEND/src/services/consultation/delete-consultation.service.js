const Consultation = require("../../models/Consultation");
const ApiError = require("../../utils/ApiError");

const deleteConsultationService = async (consultationId, deletedBy) => {
  const consultation = await Consultation.findOne({
    _id: consultationId,
    isDeleted: false,
  });

  if (!consultation) {
    throw new ApiError(404, "Consultation not found", "CONSULTATION_NOT_FOUND");
  }

  consultation.isDeleted = true;

  consultation.deletedBy = deletedBy;

  consultation.deletedAt = new Date();

  await consultation.save();

  return {
    message: "Consultation deleted successfully",
  };
};

module.exports = deleteConsultationService;
