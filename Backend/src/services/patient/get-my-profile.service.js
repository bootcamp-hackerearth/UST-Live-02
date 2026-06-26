const Patient = require("../../models/Patient");
const ERR = require("../../utils/errors");

const getMyProfile = async (patientId) => {
  const patient = await Patient.findOne({
    _id: patientId,
    isDeleted: { $ne: true },
  });

  if (!patient) {
throw ERR.patientNotFound(); }

  return patient;
};

module.exports = getMyProfile;

