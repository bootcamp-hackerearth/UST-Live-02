const { createAuthUser, createEmployee } = require('../services/user.service');
const Doctor = require('../models/doctor.model');
const Role = require('../models/role.model');
const generateId = require('../utils/idGenerator');

const createDoctor = async (doctorData) => {
    const {
        firstName,
        lastName,
        email,
        password,
        phone,
        roleName,
        department,
        designation,
        specialization,
        qualification,
        consultationFee,
        medicalRegistrationNo,
        availabilityStartTime,
        availabilityEndTime,
        experienceYears,
    } = doctorData;

    const role = await Role.findOne({ name: roleName });
    if (!role) {
        throw new Error('Role not found');
    }

    const roleId = role._id;
    const user = await createAuthUser({ firstName, lastName, email, password, phone, roleId });
    const EMPID = await generateId(role.roleCode);
    const userId = user._id;
    const employee = await createEmployee({ userId, EMPID, department, designation, status: true });

    const doctor = await Doctor.create({
        employeeId: employee._id,
        specialization,
        qualification,
        consultationFee,
        medicalRegistrationNo,
        availabilityStartTime,
        availabilityEndTime,
        experienceYears,
    });

    return {
        user,
        doctor,
        employee,
    };
};

module.exports = { createDoctor };