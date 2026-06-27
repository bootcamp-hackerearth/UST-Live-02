const Patient = require("../../models/Patient");
const ERR = require("../../utils/errors");
const {
  findEmbeddedHealthRecord,
  isActiveRecord,
  normalizeHealthRecord,
} = require("./health-record.helpers");

const updateHealthRecord = async (id, updateData, file, user) => {
  const { patientId, createdBy, deletedBy, deletedDate, isDeleted, ...safeData } =
    updateData;

  if (file) {
    safeData.filePath = `/uploads/health-records/${file.filename}`;
    safeData.originalFileName = file.originalname;
    safeData.mimeType = file.mimetype;
    safeData.fileSize = file.size;
  }

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

  record.set({
    ...safeData,
    updatedBy: user.userId,
  });

  await patient.save();

  return normalizeHealthRecord(record, patient);
};

module.exports = updateHealthRecord;
