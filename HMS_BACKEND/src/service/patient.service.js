const Patient = require('../models/Patient.model');
const ApiError = require('../utils/ApiError');

exports.createPatient = async (patientData, employeeId) => {
  const {
    firstName,
    lastName,
    phone,
    gender,
    dob,
    bloodGroup,
    address,
    emergencyContactName,
    emergencyContactPhone
  } = patientData;

  const patient = await Patient.create({
    firstName,
    lastName,
    phone,
    gender,
    dob,
    bloodGroup,
    address,
    emergencyContactName,
    emergencyContactPhone,
    createdBy: employeeId
  });

  return patient;
};



exports.getAllPatients = async () => {
  const patients = await Patient.find()
    .populate({
      path: "createdBy",
      select: "firstName lastName email roleId",
      populate: {
        path: "roleId",
        select: "name roleCode"
      }
    })
    .sort({ createdAt: -1 });

  return patients.map((patient) => ({
    patientId: patient._id,
    UHID: patient.UHID,

    firstName: patient.firstName,
    lastName: patient.lastName,
    phone: patient.phone,

    gender: patient.gender,
    dob: patient.dob,
    bloodGroup: patient.bloodGroup,

    city: patient.address?.city,
    state: patient.address?.state,
    pincode: patient.address?.pincode,

    emergencyContactName: patient.emergencyContactName,
    emergencyContactPhone: patient.emergencyContactPhone,

  createdByName:
  (
    `${patient.createdBy?.firstName || ""} ${patient.createdBy?.lastName || ""}`.trim()
    || patient.createdBy?.email
    || "Unknown User"
  ),

    createdByEmail: patient.createdBy?.email,
    createdByRole: patient.createdBy?.roleId?.name,
    createdByRoleCode: patient.createdBy?.roleId?.roleCode,

    createdAt: patient.createdAt
  }));
};