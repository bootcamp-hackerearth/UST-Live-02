const Patient = require("../../models/Patient");
const ERR = require("../../utils/errors");
const {
  findEmbeddedHealthRecord,
  isActiveRecord,
  normalizeHealthRecord,
} = require("./health-record.helpers");

const getHealthRecordById = async (id, user) => {
  const patientFilter = {
    healthRecords: {
      $elemMatch: {
        _id: id,
        isDeleted: { $ne: true },
      },
    },
    isDeleted: { $ne: true },
  };

  if (user.roles?.includes("PATIENT")) {
    patientFilter._id = user.patientId;
  }

  const patient = await Patient.findOne(patientFilter)
    .select("patientId firstName lastName gender status email phone healthRecords")
    .populate("healthRecords.createdBy", "email roles")
    .populate("healthRecords.updatedBy", "email roles")
    .lean();

  const record = findEmbeddedHealthRecord(patient || {}, id);

  if (!isActiveRecord(record)) {
    throw ERR.healthRecordNotFound();
  }

  return normalizeHealthRecord(record, patient);
};

module.exports = getHealthRecordById;
