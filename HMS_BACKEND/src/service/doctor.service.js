const User = require('../models/User.model')
const RoleModel = require('../models/Role.model')
const Employee = require('../models/Employee.model')
const Doctor = require('../models/Doctor.model')
const bcrypt = require('bcrypt');
const ApiError = require('../utils/ApiError');
const userService = require('./user.service')

exports.createDoctorByAdmin = async (doctorData) => {
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
        experienceYears,
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
exports.updateDoctor = async (doctorId, data) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        department,
        designation,
        joiningDate,
        status,
        specialization,
        qualification,
        consultationFee,
        medicalRegistrationNo,
        availabilityStartTime,
        availabilityEndTime,
        experienceYears
    } = data;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) throw new ApiError(404, 'Doctor not found');

    const employee = await Employee.findById(doctor.employeeId);
    if (!employee) throw new ApiError(404, 'Employee record not found for this doctor');

    const user = await User.findById(employee.userId);
    if (!user) throw new ApiError(404, 'User record not found for this doctor');

    await updateUserEmail(user, email);
    await updateMedicalRegNo(doctor, medicalRegistrationNo);

    updateUserFields(user, { firstName, lastName, status });
    updateEmployeeFields(employee, { phone, department, designation, joiningDate, status });
    updateDoctorFields(doctor, { specialization, qualification, consultationFee, availabilityStartTime, availabilityEndTime, experienceYears });

    await user.save();
    await employee.save();
    await doctor.save();

    return buildDoctorResponse(doctor, employee, user);
};


const updateUserEmail = async (user, email) => {
    if (!email || email === user.email) return;
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new ApiError(409, 'Email already exists');
    user.email = email;
};

const updateMedicalRegNo = async (doctor, medicalRegistrationNo) => {
    if (!medicalRegistrationNo || medicalRegistrationNo === doctor.medicalRegistrationNo) return;
    const existingDoctor = await Doctor.findOne({ medicalRegistrationNo });
    if (existingDoctor) throw new ApiError(409, 'Medical registration number already exists');
    doctor.medicalRegistrationNo = medicalRegistrationNo;
};


const updateUserFields = (user, { firstName, lastName, status }) => {
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (status !== undefined) user.status = status;
};

const updateEmployeeFields = (employee, { phone, department, designation, joiningDate, status }) => {
    if (phone !== undefined) employee.phone = phone;
    if (department !== undefined) employee.department = department;
    if (designation !== undefined) employee.designation = designation;
    if (joiningDate !== undefined) employee.joiningDate = joiningDate;
    if (status !== undefined) employee.status = status;
};


const updateDoctorFields = (doctor, { specialization, qualification, consultationFee, availabilityStartTime, availabilityEndTime, experienceYears }) => {
    if (specialization !== undefined) doctor.specialization = specialization;
    if (qualification !== undefined) doctor.qualification = qualification;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (availabilityStartTime !== undefined) doctor.availabilityStartTime = availabilityStartTime;
    if (availabilityEndTime !== undefined) doctor.availabilityEndTime = availabilityEndTime;
    if (experienceYears !== undefined) doctor.experienceYears = experienceYears;
};

const buildDoctorResponse = (doctor, employee, user) => ({
    doctorId: doctor._id,
    employeeId: employee._id,
    employeeCode: employee.employeeCode,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: employee.phone,
    department: employee.department,
    designation: employee.designation,
    joiningDate: employee.joiningDate,
    specialization: doctor.specialization,
    qualification: doctor.qualification,
    consultationFee: doctor.consultationFee,
    medicalRegistrationNo: doctor.medicalRegistrationNo,
    availabilityStartTime: doctor.availabilityStartTime,
    availabilityEndTime: doctor.availabilityEndTime,
    experienceYears: doctor.experienceYears,
    status: user.status,
    isVerified: user.isVerified
});

exports.getAllDoctors = async () => {
    const doctors = await Doctor.find()
        .populate({
            path: 'employeeId',
            populate: {
                path: 'userId',
                select: 'firstName lastName email phone status isVerified'
            }
        })
        .sort({ createdAt: -1 });

    return doctors.map((doctor) => ({
        doctorId: doctor._id,

        employeeId: doctor.employeeId?._id,
        employeeCode: doctor.employeeId?.employeeCode,

        firstName: doctor.employeeId?.userId?.firstName,
        lastName: doctor.employeeId?.userId?.lastName,
        email: doctor.employeeId?.userId?.email,
        phone: doctor.employeeId?.phone,

        specialization: doctor.specialization,
        qualification: doctor.qualification,
        consultationFee: doctor.consultationFee,
        medicalRegistrationNo: doctor.medicalRegistrationNo,
        availabilityStartTime: doctor.availabilityStartTime,
        availabilityEndTime: doctor.availabilityEndTime,
        experienceYears: doctor.experienceYears,

        status: doctor.employeeId?.userId?.status,
        isVerified: doctor.employeeId?.userId?.isVerified
    }));
};