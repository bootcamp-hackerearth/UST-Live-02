const Patient = require("../../models/Patient");

const getMyProfile = async (
  patientId
) => {

  const patient =
    await Patient.findById(
      patientId
    );

  if (!patient) {

    throw new Error(
      "Patient not found"
    );
  }

  return patient;
};

module.exports =
  getMyProfile;