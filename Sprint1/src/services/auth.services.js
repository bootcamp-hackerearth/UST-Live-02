const bcrypt = require("bcrypt");
const ApiError = require("../utils/ApiError");
const jwt = require("../utils/jwt");
const User = require("../models/user.model");
const Role = require("../models/role.model");
const Employee = require("../models/employee.model");
const Doctor = require("../models/doctor.model");
const verifyUserByEmail = async (token) => {
  if (!token) {
    throw new ApiError(400, "Token is required");
  }
  const decoded = jwt.verifyToken({ token, type: jwt.tokenType.VERIFY_EMAIL });
  const userId = decoded.userId;
  const user = await User.findOne({ _id: userId });
  user.isVerified = true;
  const savedUser = user.save();
  return {
    isVerified: savedUser.isVerified,
    email: user.email,
  };
};
const loginUser = async (password, email) => {
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user) {
    throw new ApiError(401, "invalid credentails");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentails");
  }

  if (!user.isVerified) {
    throw new ApiError(403, "verify emai before logging in ");
  }
  const role = await Role.findById(user.roleId);
  const token = jwt.generateToken({
    payload: {
      userId: user._id,
      role: role.roleCode,
    },
    type: jwt.tokenType.ACCESS,
  });
  return token;
};
const getUserInfo = async (userId, role) => {
  const user = await User.findById(userId)
    .select("-passwordHash")
    .populate("roleId", "name roleCode");

  if (!user) {
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
      lastLoginAt: user.lastLoginAt,
    },
  };

  if (employee) {
    profile.employee = {
      id: employee._id,
      employeeCode: employee.employeeCode,
      phone: employee.phone,
      department: employee.department,
      designation: employee.designation,
      status: employee.status,
      joiningDate: employee.joiningDate,
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
        experienceYears: doctor.experienceYears,
      };
    }
  }

  return profile;
};
module.exports = {
  verifyUserByEmail,
  loginUser,
  getUserInfo,
};
 