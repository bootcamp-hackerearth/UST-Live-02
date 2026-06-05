const Patient = require('../models/patient.model');
const generateId = require('../utils/idGenerator');
const createPatient = async (patientData) => {
    const {
        fullName,
        phone,
        email,
        gender,
        dob,
        bloodGroup,
        address,
        emergencyContactName,
        emergencyContactPhone
    } = patientData
    const UHID = `URN-${generateId()}`;
    const patient = await Patient.create({
        UHID,
        fullName,
        phone,
        email,
        gender,
        dob,
        bloodGroup,
        address,
        emergencyContactName,
        emergencyContactPhone,
    });
    return patient;
}
module.exports = { createPatient };