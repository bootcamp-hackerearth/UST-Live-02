const Patient = require("../../models/Patient");

const User = require("../../models/User");
const ApiError = require("../../utils/ApiError");

const deletePatientService = async (patientId, deletedBy) => {
  const patient = await Patient.findOne({
    _id: patientId,
    isDeleted: false,
  });

  if (!patient) {
    throw new ApiError(404, "Patient not found", "PATIENT_NOT_FOUND");
  }

  patient.isDeleted = true;
  patient.deletedBy = deletedBy;
  patient.deletedAt = new Date();

  await patient.save();

  await User.findOneAndUpdate(
    {
      patientId,
      isDeleted: false,
    },
    {
      isDeleted: true,
      deletedBy,
      deletedAt: new Date(),
    },
  );

  return {
    message: "Patient deleted successfully",
  };
};

module.exports = deletePatientService;
