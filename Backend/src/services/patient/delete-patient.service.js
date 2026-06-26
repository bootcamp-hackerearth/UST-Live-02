const Patient = require("../../models/Patient");
const User = require("../../models/User");
const STATUS = require("../../constants/status");
const ERR = require("../../utils/errors");

const deletePatientService = async (patientId, deletedBy) => {
  const patient = await Patient.findOne({
    _id: patientId,
    isDeleted: { $ne: true },
  });

  if (!patient) {
    throw ERR.patientNotFound();
  }

  patient.isDeleted = true;
  patient.deletedBy = deletedBy;
  patient.deletedDate = new Date();
  patient.status = STATUS.INACTIVE;

  await patient.save();

  await User.findOneAndUpdate(
    { patientId },
    {
      status: STATUS.INACTIVE,
    }
  );

  return patient;
};

module.exports = deletePatientService;

