const User = require('../models/User.model')
const RoleModel = require('../models/Role.model');
const Employee = require('../models/Employee.model')
const Doctor = require('../models/Doctor.model')
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt')
const jwt = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

exports.createEmployeeUser = async (userData) => {
    const {
        firstName,
        lastName,
        email,
        password,
        phone,
        role,
        department,
        designation,
        joiningDate,
    } = userData;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(409, 'User already exists with this email');
    }

    const employeeRole = await RoleModel.findOne({ name: role });

    if (!employeeRole) {
        throw new ApiError(404, 'Role not found');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
        firstName,
        lastName,
        email,
        passwordHash,
        roleId: employeeRole._id,
        status: 'ACTIVE',
        mustChangePassword: true
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    const verificationToken = await generateToken({
        payload: {
            userId: user._id,
            email: user.email,
        },
        type: jwt.tokenType.VERIFY_EMAIL,
    });
    const verificationLink = `http://localhost:5000/api/auth/verify-email/${verificationToken}`;
    console.log("Verification Link", verificationLink)

    const employee = await Employee.create({
        userId: user._id,
        phone,
        department,
        designation,
        joiningDate
    });

    return {
        employeeId: employee._id,
        userId: user._id,
        employeeCode: employee.employeeCode,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: employee.phone,
        role: employeeRole.name,
        department: employee.department,
        designation: employee.designation,
        joiningDate: employee.joiningDate,
        employeeStatus: employee.status,
        isVerified: user.isVerified,
        userStatus: user.status,
        mustChangePassword: user.mustChangePassword
    };
};

exports.currentProfile = async (userId) => {
    const user = await User.findById(userId)
        .select("-passwordHash")
        .populate("roleId", "name roleCode");

    if (!user) {
        // User resource not found in database, so returning 404.
        throw new ApiError(404, "User not found");
    }

    const employee = await Employee.findOne({ userId: user._id });

    const profile = {
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.roleId?.name,
            roleCode: user.roleId?.roleCode,
            isVerified: user.isVerified,
            status: user.status,
            mustChangePassword: user.mustChangePassword,
            lastLoginAt: user.lastLoginAt
        }
    };

    if (employee) {
        profile.employee = {
            id: employee._id,
            employeeCode: employee.employeeCode,
            phone: employee.phone,
            department: employee.department,
            designation: employee.designation,
            status: employee.status,
            joiningDate: employee.joiningDate
        };

        const doctor = await Doctor.findOne({ employeeId: employee._id });

        if (doctor) {
            profile.doctor = {
                id: doctor._id,
                specialization: doctor.specialization,
                qualification: doctor.qualification,
                consultationFee: doctor.consultationFee,
                medicalRegistrationNo: doctor.medicalRegistrationNo,
                availabilityStartTime: doctor.availabilityStartTime,
                availabilityEndTime: doctor.availabilityEndTime,
                experienceYears: doctor.experienceYears
            };
        }
    }

    return profile;
};