const Patient = require("../../models/Patient");
const ERR = require("../../utils/errors");

const updateMyProfile = async (patientId, updateData) => {
  if (updateData.maritalStatus === "") {
    delete updateData.maritalStatus;
  }

  if (updateData.gender === "") {
    delete updateData.gender;
  }
  const patient = await Patient.findOneAndUpdate(
    {
      _id: patientId,
      isDeleted: { $ne: true },
    },
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!patient) {
throw ERR.patientNotFound();
  }

  return patient;
};

module.exports = updateMyProfile;

