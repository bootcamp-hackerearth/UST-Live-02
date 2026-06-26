const User = require("../models/User.model");
const RoleModel = require("../models/Role.model");
const Employee = require("../models/Employee.model");
const Doctor = require("../models/Doctor.model");
const Appointment = require("../models/Appointment.model");
const bcrypt = require("bcrypt");
const ApiError = require("../utils/ApiError");
const sendEmail = require("./mail.service");
const {
  getPagination,
  buildPaginationResponse,
} = require("../utils/pagination");

exports.createEmployeeUser = async (userData, loggedInUserId) => {
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

  const loggedInUser = await User.findById(loggedInUserId).populate("roleId");

  if (!loggedInUser) {
    throw new ApiError(404, "Logged in user not found");
  }

  const creatorRole = loggedInUser.roleId.name;

  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    throw new ApiError(409, "User already exists with this email");
  }

  // Nobody can create Owner

  if (role === "Owner") {
    throw new ApiError(
      403,
      "Owner accounts can only be created through system seeding",
    );
  }

  // Admin cannot create Admin

  if (creatorRole === "Admin" && role === "Admin") {
    throw new ApiError(403, "Admins cannot create other Admins");
  }

  const employeeRole = await RoleModel.findOne({ name: role });

  if (!employeeRole) {
    throw new ApiError(404, "Employee role Not Found");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    firstName,
    lastName,
    email,
    passwordHash,
    roleId: employeeRole._id,
    isVerified: true,
    status: "ACTIVE",
    mustChangePassword: true,
  });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const employee = await Employee.create({
    userId: user._id,
    phone,
    department,
    designation,
    joiningDate,
  });
  let emailSent = false;
  try {
    await sendEmail(
      email,
      "HMS Employee Login Credentials",
      `
    <h2>Welcome to HMS</h2>

    <p>Hello ${firstName} ${lastName},</p>

    <p>Your employee account has been created successfully.</p>

    <p><strong>Login Email:</strong> ${email}</p>
    <p><strong>Temporary Password:</strong> ${password}</p>

    <p>Please login using the above credentials.</p>
    <p>For security reasons, you must change your password after first login.</p>

    <br/>
    <p>Regards,</p>
    <p>HMS Admin Team</p>
    `,
    );
    emailSent = true;
  } catch (error) {
    console.log("Email sending failed, but account creation will continue");
    console.log(error.message);
  }
  return {
    employeeId: employee._id,
    employeeCode: employee.employeeCode,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: employee.phone,
    role: employeeRole.name,
    department: employee.department,
    designation: employee.designation,
    joiningDate: employee.joiningDate,
    isVerified: user.isVerified,
    status: user.status,
    mustChangePassword: user.mustChangePassword,
    emailSent,
  };
};

exports.updateEmployee = async (employeeId, data, loggedInUserId) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    department,
    designation,
    joiningDate,
    status,
  } = data;

  const employee = await Employee.findById(employeeId);

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  if (employee.userId.toString() === loggedInUserId.toString()) {
    throw new ApiError(403, "You cannot edit your own employee profile");
  }

  const user = await User.findById(employee.userId);

  if (!user) {
    throw new ApiError(404, "User not found for this employee");
  }

  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new ApiError(409, "Email already exists");
    }

    user.email = email;
  }

  if (firstName !== undefined) {
    user.firstName = firstName;
  }

  if (lastName !== undefined) {
    user.lastName = lastName;
  }

  if (status !== undefined) {
    user.status = status;
    employee.status = status;
  }

  if (phone !== undefined) {
    employee.phone = phone;
  }

  if (department !== undefined) {
    employee.department = department;
  }

  if (designation !== undefined) {
    employee.designation = designation;
  }

  if (joiningDate !== undefined) {
    employee.joiningDate = joiningDate;
  }

  await user.save();
  await employee.save();

  return {
    employeeId: employee._id,
    employeeCode: employee.employeeCode,

    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,

    phone: employee.phone,
    department: employee.department,
    designation: employee.designation,
    joiningDate: employee.joiningDate,

    isVerified: user.isVerified,
    status: user.status,
    mustChangePassword: user.mustChangePassword,
  };
};

exports.currentProfile = async (userId) => {
  const employeeProfile = await Employee.findOne({ userId }).populate({
    path: "userId",
    select: "-passwordHash",
    populate: {
      path: "roleId",
      select: "name roleCode",
    },
  });

  if (!employeeProfile) {
    throw new ApiError(404, "Employee profile not found");
  }

  return {
    userId: employeeProfile.userId._id,

    firstName: employeeProfile.userId.firstName,
    lastName: employeeProfile.userId.lastName,
    email: employeeProfile.userId.email,

    role: employeeProfile.userId.roleId.name,
    roleCode: employeeProfile.userId.roleId.roleCode,

    isVerified: employeeProfile.userId.isVerified,
    status: employeeProfile.userId.status,
    mustChangePassword: employeeProfile.userId.mustChangePassword,

    employeeId: employeeProfile._id,
    employeeCode: employeeProfile.employeeCode,
    phone: employeeProfile.phone,
    department: employeeProfile.department,
    designation: employeeProfile.designation,
    joiningDate: employeeProfile.joiningDate,
  };
};

// to get all the employees with pagination and search
exports.getAllEmployees = async (query = {}) => {
  const { page, limit, skip, sortBy, sortOrder } = getPagination(query);
  const search = query.search ? query.search.trim() : "";

  const allowedSortFields = [
    "createdAt",
    "employeeCode",
    "department",
    "designation",
    "status",
  ];

  const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

  const filter = { isDeleted: false };

  if (search) {
    const matchingUsers = await User.find({
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    }).select("_id");

    const matchingUserIds = matchingUsers.map((user) => user._id);

    filter.$or = [
      { employeeCode: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { department: { $regex: search, $options: "i" } },
      { designation: { $regex: search, $options: "i" } },
      { status: { $regex: search, $options: "i" } },
      { userId: { $in: matchingUserIds } },
    ];
  }

  const totalRecords = await Employee.countDocuments(filter);

  const employees = await Employee.find(filter)
    .populate({
      path: "userId",
      select: "firstName lastName email roleId isVerified status",
      populate: {
        path: "roleId",
        select: "name roleCode",
      },
    })
    .sort({ [finalSortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  const formattedEmployees = employees.map((employee) => ({
    employeeId: employee._id,
    userId: employee.userId?._id,

    employeeCode: employee.employeeCode,

    firstName: employee.userId?.firstName,
    lastName: employee.userId?.lastName,
    email: employee.userId?.email,

    role: employee.userId?.roleId?.name,
    roleCode: employee.userId?.roleId?.roleCode,
    isVerified: employee.userId?.isVerified,

    phone: employee.phone,
    department: employee.department,
    designation: employee.designation,
    joiningDate: employee.joiningDate,
    status: employee.status,
  }));

  return {
    employees: formattedEmployees,
    pagination: buildPaginationResponse({
      page,
      limit,
      totalRecords,
    }),
  };
};

//helper functions in the next sprint will be changed to reusable helpers

const parseTimeToMinutes = (timeValue) => {
  const [time, period] = timeValue.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
};

const hasUpcomingBookedAppointment = async (doctorId) => {
  const bookedAppointments = await Appointment.find({
    doctorId,
    status: "BOOKED",
  }).select("appointmentDate timeSlot");

  const now = new Date();

  return bookedAppointments.some((appointment) => {
    const appointmentDateTime = new Date(appointment.appointmentDate);

    const slotMinutes = parseTimeToMinutes(appointment.timeSlot);

    appointmentDateTime.setHours(
      Math.floor(slotMinutes / 60),
      slotMinutes % 60,
      0,
      0,
    );

    return appointmentDateTime > now;
  });
};

//checking the doctor appointment logic
exports.softDeleteEmployeeById = async (employeeId, deletedByUserId) => {
  const employee = await Employee.findOne({
    _id: employeeId,
    isDeleted: false,
  });

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  if (employee.userId.toString() === deletedByUserId.toString()) {
    throw new ApiError(403, "You cannot delete your own employee profile");
  }

  const user = await User.findById(employee.userId);

  if (!user) {
    throw new ApiError(404, "User not found for this employee");
  }

  const doctor = await Doctor.findOne({
    employeeId: employee._id,
    isDeleted: false,
  });

  if (doctor) {
    const hasUpcomingAppointment = await hasUpcomingBookedAppointment(
      doctor._id,
    );

    if (hasUpcomingAppointment) {
      throw new ApiError(
        400,
        "Doctor cannot be deleted because upcoming booked appointments exist",
      );
    }

    doctor.isDeleted = true;
    doctor.deletedAt = new Date();
    doctor.deletedBy = deletedByUserId;

    await doctor.save();
  }

  employee.isDeleted = true;
  employee.status = "INACTIVE";
  employee.deletedAt = new Date();
  employee.deletedBy = deletedByUserId;

  user.status = "INACTIVE";

  await employee.save();
  await user.save();

  return {
    employeeId: employee._id,
    employeeCode: employee.employeeCode,
    message: doctor
      ? "Doctor and employee deleted successfully"
      : "Employee deleted successfully",
  };
};
