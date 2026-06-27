const mongoose = require("mongoose");

const Consultation = require("../../models/Consultation");
const Patient = require("../../models/Patient");

const ROLES = require("../../constants/roles");
const ApiError = require("../../utils/ApiError");

const getHealthRecordDetailsService = async (patientId, user, query) => {
  /*
  |--------------------------------------------------------------------------
  | Pagination Params
  |--------------------------------------------------------------------------
  */

  const limit = Number(query.limit) || 5;

  const timelinePage = Number(query.timelinePage) || 1;

  const labPage = Number(query.labPage) || 1;

  const documentPage = Number(query.documentPage) || 1;

  /*
  |--------------------------------------------------------------------------
  | Patient
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | Doctor Access Check
  |--------------------------------------------------------------------------
  */

  if (user.roles?.includes(ROLES.DOCTOR)) {
    const hasAccess = await Consultation.exists({
      patientId,
      doctorEmployeeId: user.employeeId,
      isDeleted: false,
    });

    if (!hasAccess) {
      throw new ApiError(403, "Access denied", "ACCESS_DENIED");
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Consultation Filter
  |--------------------------------------------------------------------------
  */

  const filter = {
    patientId,
    isDeleted: false,
  };

  if (user.roles?.includes(ROLES.DOCTOR)) {
    filter.doctorEmployeeId = new mongoose.Types.ObjectId(user.employeeId);
  }

  /*
  |--------------------------------------------------------------------------
  | Timeline Pagination
  |--------------------------------------------------------------------------
  */

  const totalConsultations = await Consultation.countDocuments(filter);

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
    })
    .skip((timelinePage - 1) * limit)
    .limit(limit)
    .lean();

  /*
  |--------------------------------------------------------------------------
  | Lab Reports Pagination
  |--------------------------------------------------------------------------
  */

  const labReports = (
    patient.labReports?.filter((report) => !report.isDeleted) ?? []
  ).sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));

  const paginatedLabReports = labReports.slice(
    (labPage - 1) * limit,
    labPage * limit,
  );

  /*
  |--------------------------------------------------------------------------
  | Medical Documents Pagination
  |--------------------------------------------------------------------------
  */

  const medicalDocuments = (
    patient.medicalDocuments?.filter((document) => !document.isDeleted) ?? []
  ).sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));
  const paginatedMedicalDocuments = medicalDocuments.slice(
    (documentPage - 1) * limit,
    documentPage * limit,
  );

  /*
  |--------------------------------------------------------------------------
  | Response
  |--------------------------------------------------------------------------
  */

  return {
    patient,
    consultations,
    labReports: paginatedLabReports,
    medicalDocuments: paginatedMedicalDocuments,

    meta: {
      consultations: {
        page: timelinePage,
        limit,
        totalRecords: totalConsultations,
        totalPages: Math.ceil(totalConsultations / limit),
      },

      labReports: {
        page: labPage,
        limit,
        totalRecords: labReports.length,
        totalPages: Math.ceil(labReports.length / limit),
      },

      medicalDocuments: {
        page: documentPage,
        limit,
        totalRecords: medicalDocuments.length,
        totalPages: Math.ceil(medicalDocuments.length / limit),
      },
    },
  };
};

module.exports = getHealthRecordDetailsService;
