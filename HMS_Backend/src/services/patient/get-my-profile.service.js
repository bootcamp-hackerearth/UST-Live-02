const Patient = require("../../models/Patient");
const ApiError = require("../../utils/ApiError");

const getMyProfile = async (patientId) => {
  const patient = await Patient.findOne({
    _id: patientId,
    isDeleted: false,
  }).populate({
    path: "assignedDoctor",
    select: "name department specialization",
    match: {
      isDeleted: false,
    },
  });

  if (!patient) {
    throw new ApiError(404, "Patient not found", "PATIENT_NOT_FOUND");
  }

  return patient;
};

module.exports = getMyProfile;
