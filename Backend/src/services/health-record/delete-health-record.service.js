const Patient = require("../../models/Patient");
const ERR = require("../../utils/errors");
const {
  findEmbeddedHealthRecord,
  isActiveRecord,
  normalizeHealthRecord,
} = require("./health-record.helpers");

const deleteHealthRecord = async (id, deletedBy) => {
  const patient = await Patient.findOne({
    healthRecords: {
      $elemMatch: {
        _id: id,
        isDeleted: { $ne: true },
      },
    },
    isDeleted: { $ne: true },
  });

  const record = findEmbeddedHealthRecord(patient || {}, id);

  if (!isActiveRecord(record)) {
    throw ERR.healthRecordNotFound();
  }

  record.isDeleted = true;
  record.deletedBy = deletedBy;
  record.deletedDate = new Date();

  await patient.save();

  return normalizeHealthRecord(record, patient);
};

module.exports = deleteHealthRecord;
