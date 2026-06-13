const Patient = require("../../models/Patient");

const updateMyProfile =
  async (
    patientId,
    updateData
  ) => {
if (
  updateData.maritalStatus === ""
) {
  delete updateData.maritalStatus;
}

if (
  updateData.gender === ""
) {
  delete updateData.gender;
}
    const patient =
      await Patient.findByIdAndUpdate(
        patientId,

        updateData,

        {
          new: true,
          runValidators: true,
        }
      );

    if (!patient) {

      throw new Error(
        "Patient not found"
      );
    }

    return patient;
  };

module.exports =
  updateMyProfile;