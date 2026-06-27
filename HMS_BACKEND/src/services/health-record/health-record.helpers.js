const buildPatientSummary = (patient) => ({
  _id: patient._id,
  patientId: patient.patientId,
  firstName: patient.firstName,
  lastName: patient.lastName,
  gender: patient.gender,
  status: patient.status,
  email: patient.email,
  phone: patient.phone,
});

const toPlainRecord = (record) => {
  if (!record) {
    return null;
  }

  return typeof record.toObject === "function" ? record.toObject() : record;
};

const normalizeHealthRecord = (record, patient) => ({
  ...toPlainRecord(record),
  patientId: buildPatientSummary(patient),
});

const isActiveRecord = (record) => record && record.isDeleted !== true;

const matchesDocumentFilter = ({ record, documentType, excludeDocumentType }) => {
  if (documentType && record.documentType !== documentType) {
    return false;
  }

  if (excludeDocumentType && record.documentType === excludeDocumentType) {
    return false;
  }

  return true;
};

const findEmbeddedHealthRecord = (patient, recordId) => {
  const records = patient.healthRecords || [];

  if (typeof records.id === "function") {
    return records.id(recordId);
  }

  return records.find((record) => record._id?.toString() === recordId.toString());
};

const DEFAULT_SORT = { createdAt: -1 };

const getSortEntry = (sort) => {
  const [[field, direction] = ["createdAt", -1]] = Object.entries(sort || DEFAULT_SORT);
  return {
    field,
    direction: Number(direction) === 1 ? 1 : -1,
  };
};

const getComparableValue = (record, field) => {
  const value = record[field];

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "string") {
    return value.toLowerCase();
  }

  return value || "";
};

const sortHealthRecords = (records, sort) => {
  const { field, direction } = getSortEntry(sort);

  return [...records].sort((left, right) => {
    const leftValue = getComparableValue(left, field);
    const rightValue = getComparableValue(right, field);

    if (leftValue > rightValue) {
      return direction;
    }

    if (leftValue < rightValue) {
      return -direction;
    }

    return 0;
  });
};

module.exports = {
  normalizeHealthRecord,
  isActiveRecord,
  matchesDocumentFilter,
  findEmbeddedHealthRecord,
  sortHealthRecords,
};
