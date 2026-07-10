const mongoose = require("mongoose");

const Consultation = require("../../models/Consultation");
const Patient = require("../../models/Patient");

const ROLES = require("../../constants/roles");
const ApiError = require("../../utils/ApiError");
const { buildPaginationMeta, decodeCursor } = require("../../utils/pagination");

const getPagingOptions = (query) => ({
  limit: Math.min(Math.max(Number(query.limit) || 5, 1), 10000),
  isCursorPagination:
    query.pagination === "cursor" ||
    Boolean(query.timelineCursor || query.labCursor || query.documentCursor),
  timelinePage: Math.max(Number(query.timelinePage) || 1, 1),
  labPage: Math.max(Number(query.labPage) || 1, 1),
  documentPage: Math.max(Number(query.documentPage) || 1, 1),
  timelineCursor: decodeCursor(query.timelineCursor),
  labCursor: decodeCursor(query.labCursor),
  documentCursor: decodeCursor(query.documentCursor),
});

const encodeSectionCursor = (item, dateField) => {
  const dateValue = item?.[dateField] || item?.createdAt;

  if (!dateValue || !item?._id) {
    return null;
  }

  return Buffer.from(
    JSON.stringify({
      createdAt: dateValue,
      id: item._id,
    }),
  ).toString("base64url");
};

const buildSectionCursorMeta = (items, hasNextPage, dateField, limit, total) => ({
  limit,
  total,
  totalRecords: total,
  nextCursor: hasNextPage
    ? encodeSectionCursor(items[items.length - 1], dateField)
    : null,
  hasNextPage,
});

const getSortableTime = (value, fallback) => {
  const timestamp = new Date(value || fallback || 0).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const isAfterCursor = (item, cursor, dateField) => {
  if (!cursor) {
    return true;
  }

  const itemTime = getSortableTime(item?.[dateField], item?.createdAt);
  const cursorTime = getSortableTime(cursor.createdAt);
  const itemId = String(item?._id || "");

  return itemTime < cursorTime || (itemTime === cursorTime && itemId < cursor.id);
};

const getPatient = async (patientId) => {
  const patient = await Patient.findOne({
    _id: patientId,
    isDeleted: false,
  })
    .select(
      `
        patientId
        firstName
        lastName
        gender
        bloodGroup
        phone
        dateOfBirth
        allergies
        chronicDiseases
        currentMedications
        medicalHistory
        labReports
        medicalDocuments
      `,
    )
    .lean();

  if (!patient) {
    throw new ApiError(404, "Patient not found", "PATIENT_NOT_FOUND");
  }

  return patient;
};

const assertDoctorCanAccessPatient = async (patientId, user) => {
  if (!user.roles?.includes(ROLES.DOCTOR)) {
    return;
  }

  const hasAccess = await Consultation.exists({
    patientId,
    doctorEmployeeId: user.employeeId,
    isDeleted: false,
  });

  if (!hasAccess) {
    throw new ApiError(403, "Access denied", "ACCESS_DENIED");
  }
};

const buildConsultationFilter = (patientId, user) => {
  const filter = {
    patientId,
    isDeleted: false,
  };

  if (user.roles?.includes(ROLES.DOCTOR)) {
    filter.doctorEmployeeId = new mongoose.Types.ObjectId(user.employeeId);
  }

  return filter;
};

const applyTimelineCursorFilter = (filter, timelineCursor) => {
  if (!timelineCursor) {
    return;
  }

  filter.$or = [
    {
      createdAt: {
        $lt: new Date(timelineCursor.createdAt),
      },
    },
    {
      createdAt: new Date(timelineCursor.createdAt),
      _id: {
        $lt: new mongoose.Types.ObjectId(timelineCursor.id),
      },
    },
  ];
};

const getConsultations = async (filter, paging) => {
  const consultationFilter = { ...filter };
  applyTimelineCursorFilter(
    consultationFilter,
    paging.isCursorPagination ? paging.timelineCursor : null,
  );

  return Consultation.find(consultationFilter)
    .populate({
      path: "doctorEmployeeId",
      select: `
          name
          department
          specialization
        `,
      match: {
        isDeleted: false,
      },
    })
    .select(
      `
        appointmentId
        patientId
        doctorEmployeeId
        diagnosis
        symptoms
        doctorNotes
        vitals
        prescriptions
        status
        createdAt
        updatedAt
      `,
    )
    .sort({
      createdAt: -1,
      _id: -1,
    })
    .skip(
      paging.isCursorPagination ? 0 : (paging.timelinePage - 1) * paging.limit,
    )
    .limit(paging.isCursorPagination ? paging.limit + 1 : paging.limit)
    .lean();
};

const sortEmbeddedRecords = (records, dateField) =>
  (records?.filter((record) => !record.isDeleted) ?? []).sort(
    (a, b) =>
      getSortableTime(b[dateField], b.createdAt) -
      getSortableTime(a[dateField], a.createdAt),
  );

const getVisibleCursorRecords = (records, cursor, dateField, limit) =>
  records
    .filter((record) => isAfterCursor(record, cursor, dateField))
    .slice(0, limit + 1);

const paginateEmbeddedSection = ({
  records,
  dateField,
  cursor,
  page,
  paging,
}) => {
  const sortedRecords = sortEmbeddedRecords(records, dateField);
  const pageRecords = paging.isCursorPagination
    ? getVisibleCursorRecords(sortedRecords, cursor, dateField, paging.limit)
    : sortedRecords.slice((page - 1) * paging.limit, page * paging.limit);
  const hasNextPage =
    paging.isCursorPagination && pageRecords.length > paging.limit;

  return {
    allRecords: sortedRecords,
    visibleRecords: hasNextPage ? pageRecords.slice(0, paging.limit) : pageRecords,
    hasNextPage,
  };
};

const buildSectionMeta = ({
  paging,
  page,
  total,
  visibleRecords,
  hasNextPage,
  dateField,
}) => {
  if (paging.isCursorPagination) {
    return buildSectionCursorMeta(
      visibleRecords,
      hasNextPage,
      dateField,
      paging.limit,
      total,
    );
  }

  return {
    ...buildPaginationMeta(page, paging.limit, total),
    totalPages: Math.max(Math.ceil(total / paging.limit), 1),
  };
};

const buildResponseMeta = ({
  paging,
  totalConsultations,
  consultations,
  hasNextConsultationsPage,
  labSection,
  documentSection,
}) => ({
  consultations: paging.isCursorPagination
    ? buildSectionCursorMeta(
        consultations,
        hasNextConsultationsPage,
        "createdAt",
        paging.limit,
        totalConsultations,
      )
    : buildPaginationMeta(
        paging.timelinePage,
        paging.limit,
        totalConsultations,
      ),
  labReports: buildSectionMeta({
    paging,
    page: paging.labPage,
    total: labSection.allRecords.length,
    visibleRecords: labSection.visibleRecords,
    hasNextPage: labSection.hasNextPage,
    dateField: "reportDate",
  }),
  medicalDocuments: buildSectionMeta({
    paging,
    page: paging.documentPage,
    total: documentSection.allRecords.length,
    visibleRecords: documentSection.visibleRecords,
    hasNextPage: documentSection.hasNextPage,
    dateField: "recordDate",
  }),
});

const getHealthRecordDetailsService = async (patientId, user, query) => {
  const paging = getPagingOptions(query);
  const patient = await getPatient(patientId);

  await assertDoctorCanAccessPatient(patientId, user);

  const filter = buildConsultationFilter(patientId, user);
  const totalConsultations = await Consultation.countDocuments(filter);
  const consultations = await getConsultations(filter, paging);
  const hasNextConsultationsPage =
    paging.isCursorPagination && consultations.length > paging.limit;
  const paginatedConsultations = hasNextConsultationsPage
    ? consultations.slice(0, paging.limit)
    : consultations;

  const labSection = paginateEmbeddedSection({
    records: patient.labReports,
    dateField: "reportDate",
    cursor: paging.labCursor,
    page: paging.labPage,
    paging,
  });
  const documentSection = paginateEmbeddedSection({
    records: patient.medicalDocuments,
    dateField: "recordDate",
    cursor: paging.documentCursor,
    page: paging.documentPage,
    paging,
  });

  /* Response */
  return {
    patient,
    consultations: paginatedConsultations,
    labReports: labSection.visibleRecords,
    medicalDocuments: documentSection.visibleRecords,
    meta: buildResponseMeta({
      paging,
      totalConsultations,
      consultations: paginatedConsultations,
      hasNextConsultationsPage,
      labSection,
      documentSection,
    }),
  };
};

module.exports = getHealthRecordDetailsService;
