const Patient = require("../../models/Patient");
const {
  isActiveRecord,
  matchesDocumentFilter,
  normalizeHealthRecord,
  sortHealthRecords,
} = require("./health-record.helpers");

const getHealthRecords = async ({
  patientId,
  user,
  documentType,
  excludeDocumentType,
  skip,
  limit,
  sort,
}) => {
  const patientFilter = {
    isDeleted: { $ne: true },
  };

  if (patientId) {
    patientFilter._id = patientId;
  }

  if (user.roles?.includes("PATIENT")) {
    patientFilter._id = user.patientId;
  }

  const patients = await Patient.find(patientFilter)
    .select("patientId firstName lastName gender status email phone healthRecords")
    .populate("healthRecords.createdBy", "email roles")
    .populate("healthRecords.updatedBy", "email roles")
    .lean();

  const records = patients.flatMap((patient) =>
    (patient.healthRecords || [])
      .filter(isActiveRecord)
      .filter((record) =>
        matchesDocumentFilter({ record, documentType, excludeDocumentType })
      )
      .map((record) => normalizeHealthRecord(record, patient))
  );

  const sortedRecords = sortHealthRecords(records, sort);
  const total = sortedRecords.length;

  return {
    records: sortedRecords.slice(skip, skip + limit),
    total,
  };
};

module.exports = getHealthRecords;
