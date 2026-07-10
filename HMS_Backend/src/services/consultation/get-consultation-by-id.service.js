const Consultation = require("../../models/Consultation");
const ApiError = require("../../utils/ApiError");

const getConsultationByIdService = async (id) => {
  const consultation = await Consultation.findOne({
    _id: id,
    isDeleted: false,
  })
    .populate({
      path: "patientId",
      match: {
        isDeleted: false,
      },
    })
    .populate({
      path: "doctorEmployeeId",
      match: {
        isDeleted: false,
      },
    })
    .populate({
      path: "appointmentId",
      match: {
        isDeleted: false,
      },
    });

  if (!consultation) {
    throw new ApiError(404, "Consultation not found", "CONSULTATION_NOT_FOUND");
  }

  return consultation;
};

module.exports = getConsultationByIdService;
