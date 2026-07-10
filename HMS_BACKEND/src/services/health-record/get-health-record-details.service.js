const mongoose = require("mongoose");

const Consultation = require("../../models/Consultation");
const Patient = require("../../models/Patient");

const ROLES = require("../../constants/roles");
const ApiError = require("../../utils/ApiError");
const { buildPaginationMeta, decodeCursor } = require("../../utils/pagination");

const assertDoctorHasPatientAccess = async (user, patientId) => {
  if (!user.roles?.includes(ROLES.DOCTOR)) return;
  const hasAccess = await Consultation.exists({
    patientId,
    doctorEmployeeId: user.employeeId,
    isDeleted: false,
  });
  if (!hasAccess) {
    throw new ApiError(403, "Access denied", "ACCESS_DENIED");
  }
};

const getHealthRecordDetailsService = async (patientId, user, query) => {
  const limit = Math.min(Math.max(Number(query.limit) || 5, 1), 10000);
  const isCursorPagination =
    query.pagination === "cursor" ||
    Boolean(query.timelineCursor || query.labCursor || query.documentCursor);

  const timelinePage = Math.max(Number(query.timelinePage) || 1, 1);

  const labPage = Math.max(Number(query.labPage) || 1, 1);

  const documentPage = Math.max(Number(query.documentPage) || 1, 1);
  const timelineCursor = decodeCursor(query.timelineCursor);
  const labCursor = decodeCursor(query.labCursor);
  const documentCursor = decodeCursor(query.documentCursor);

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

  const buildSectionCursorMeta = (items, hasNextPage, dateField) => ({
    limit,
    nextCursor: hasNextPage
      ? encodeSectionCursor(items[items.length - 1], dateField)
      : null,
    hasNextPage,
  });

  const isAfterCursor = (item, cursor, dateField) => {
    if (!cursor) {
      return true;
    }

    const itemTime = getSortableTime(item?.[dateField], item?.createdAt);
    const cursorTime = getSortableTime(cursor.createdAt);
    const itemId = String(item?._id || "");

    return (
      itemTime < cursorTime || (itemTime === cursorTime && itemId < cursor.id)
    );
  };

  const paginateInMemory = (allItems, cursor, page, dateField) => {
    const filtered = isCursorPagination
      ? allItems.filter((item) => isAfterCursor(item, cursor, dateField))
      : allItems;
    const start = isCursorPagination ? 0 : (page - 1) * limit;
    const end = isCursorPagination ? limit + 1 : page * limit;
    const paginated = filtered.slice(start, end);
    const hasNextPage = isCursorPagination && paginated.length > limit;
    return {
      visible: hasNextPage ? paginated.slice(0, limit) : paginated,
      hasNextPage,
    };
  };

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

  await assertDoctorHasPatientAccess(user, patientId);

  const filter = {
    patientId,
    isDeleted: false,
  };

  if (user.roles?.includes(ROLES.DOCTOR)) {
    filter.doctorEmployeeId = new mongoose.Types.ObjectId(user.employeeId);
  }

  const totalConsultationFilter = {
    ...filter,
  };

  if (isCursorPagination && timelineCursor) {
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
  }

  const totalConsultations = await Consultation.countDocuments(
    totalConsultationFilter,
  );

  const consultations = await Consultation.find(filter)
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
    .skip(isCursorPagination ? 0 : (timelinePage - 1) * limit)
    .limit(isCursorPagination ? limit + 1 : limit)
    .lean();
  const hasNextConsultationsPage =
    isCursorPagination && consultations.length > limit;
  const paginatedConsultations = hasNextConsultationsPage
    ? consultations.slice(0, limit)
    : consultations;

  /* Lab Reports Pagination */
  const getSortableTime = (value, fallback) => {
    const timestamp = new Date(value || fallback || 0).getTime();

    return Number.isNaN(timestamp) ? 0 : timestamp;
  };

  const allLabReports = (
    patient.labReports?.filter((report) => !report.isDeleted) ?? []
  ).sort(
    (a, b) =>
      getSortableTime(b.reportDate, b.createdAt) -
      getSortableTime(a.reportDate, a.createdAt),
  );
  const { visible: visibleLabReports, hasNextPage: hasNextLabReportsPage } =
    paginateInMemory(allLabReports, labCursor, labPage, "reportDate");

  /* Medical Documents Pagination */
  const allMedicalDocuments = (
    patient.medicalDocuments?.filter((document) => !document.isDeleted) ?? []
  ).sort(
    (a, b) =>
      getSortableTime(b.recordDate, b.createdAt) -
      getSortableTime(a.recordDate, a.createdAt),
  );
  const labTotalPages = Math.max(Math.ceil(allLabReports.length / limit), 1);
  const documentTotalPages = Math.max(
    Math.ceil(allMedicalDocuments.length / limit),
    1,
  );
  const { visible: visibleMedicalDocuments, hasNextPage: hasNextMedicalDocumentsPage } =
    paginateInMemory(allMedicalDocuments, documentCursor, documentPage, "recordDate");

  /* Response */
  return {
    patient,
    consultations: paginatedConsultations,
    labReports: visibleLabReports,
    medicalDocuments: visibleMedicalDocuments,
    meta: {
      consultations: isCursorPagination
        ? buildSectionCursorMeta(
            paginatedConsultations,
            hasNextConsultationsPage,
            "createdAt",
          )
        : buildPaginationMeta(timelinePage, limit, totalConsultations),
      labReports: isCursorPagination
        ? buildSectionCursorMeta(
            visibleLabReports,
            hasNextLabReportsPage,
            "reportDate",
          )
        : {
            ...buildPaginationMeta(labPage, limit, allLabReports.length),
            totalPages: labTotalPages,
          },
      medicalDocuments: isCursorPagination
        ? buildSectionCursorMeta(
            visibleMedicalDocuments,
            hasNextMedicalDocumentsPage,
            "recordDate",
          )
        : {
            ...buildPaginationMeta(
              documentPage,
              limit,
              allMedicalDocuments.length,
            ),
            totalPages: documentTotalPages,
          },
    },
  };
};

module.exports = getHealthRecordDetailsService;
