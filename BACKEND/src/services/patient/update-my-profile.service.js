const Patient = require("../../models/Patient");
const ApiError = require("../../utils/ApiError");

const updateMyProfile = async (patientId, updateData, updatedBy) => {
  if (updateData.maritalStatus === "") {
    delete updateData.maritalStatus;
  }

  if (updateData.gender === "") {
    delete updateData.gender;
  }

  const patient = await Patient.findOne({
    _id: patientId,
    isDeleted: false,
  });

  if (!patient) {
    throw new ApiError(404, "Patient not found", "PATIENT_NOT_FOUND");
  }

  Object.assign(patient, updateData);

  patient.updatedBy = updatedBy;

  await patient.save();

  return patient;
};

module.exports = updateMyProfile;
