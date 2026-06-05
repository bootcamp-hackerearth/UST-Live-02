const Doctor = require('../models/Doctor.model');
const userService = require('./user.service');
const { generateToken } = require('../utils/jwt');
const jwt = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

exports.createDoctor = async (doctorData) => {
    const {
        firstName,
        lastName,
        email,
        password,
        phone,
        department,
        designation,
        joiningDate,
        specialization,
        qualification,
        consultationFee,
        medicalRegistrationNo,
        availabilityStartTime,
        availabilityEndTime,
        experienceYears
    } = doctorData;
    const existingDoctor = await Doctor.findOne({ medicalRegistrationNo });
    if (existingDoctor) {
        throw new ApiError(409, 'Medical registration number already exists');
    }

    const employeeData = await userService.createEmployeeUser({
        firstName,
        lastName,
        email,
        password,
        phone,
        role: 'Doctor',
        department,
        designation,
        joiningDate
    });

    const doctor = await Doctor.create({
        employeeId: employeeData.employeeId,
        specialization,
        qualification,
        consultationFee,
        medicalRegistrationNo,
        availabilityStartTime,
        availabilityEndTime,
        experienceYears
    });
 
    return {
        employeeId: employeeData.employeeId,
        employeeCode: employeeData.employeeCode,
        doctorId: doctor._id,
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        email: employeeData.email,
        phone: employeeData.phone,
        role: employeeData.role,
        department: employeeData.department,
        designation: employeeData.designation,
        joiningDate: employeeData.joiningDate,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        consultationFee: doctor.consultationFee,
        medicalRegistrationNo: doctor.medicalRegistrationNo,
        availabilityStartTime: doctor.availabilityStartTime,
        availabilityEndTime: doctor.availabilityEndTime,
        experienceYears: doctor.experienceYears,
        isVerified: employeeData.isVerified,
        status: employeeData.status,
        mustChangePassword: employeeData.mustChangePassword,
        emailSent: employeeData.emailSent
    };
};