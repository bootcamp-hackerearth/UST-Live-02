const Patient = require("../../models/Patient");
const ERR = require("../../utils/errors");
const { normalizeHealthRecord } = require("./health-record.helpers");

const createHealthRecord = async (recordData, file, user) => {
  const patient = await Patient.findOne({
    _id: recordData.patientId,
    isDeleted: { $ne: true },
  });

  if (!patient) {
    throw ERR.patientNotFound();
  }

  const record = {
    title: recordData.title,
    documentType: recordData.documentType,
    documentDate: recordData.documentDate,
    notes: recordData.notes,
    filePath: `/uploads/health-records/${file.filename}`,
    originalFileName: file.originalname,
    mimeType: file.mimetype,
    fileSize: file.size,
    createdBy: user.userId,
  };

  patient.healthRecords.push(record);
  await patient.save();

  const createdRecord = patient.healthRecords[patient.healthRecords.length - 1];

  return normalizeHealthRecord(createdRecord, patient);
};

module.exports = createHealthRecord;
