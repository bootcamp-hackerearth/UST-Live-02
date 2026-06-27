const mongoose = require("mongoose");

const registerEmployee = require("../services/employee/register-employee.service");
const getEmployeesService = require("../services/employee/get-employees.service");
const getEmployeeByIdService = require("../services/employee/get-employee-by-id.service");
const updateEmployeeService = require("../services/employee/update-employee.service");
const deleteEmployeeService = require("../services/employee/delete-employee.service");
const activateEmployeeService = require("../services/employee/activate-employee.service");
const deactivateEmployeeService = require("../services/employee/deactivate-employee.service");
const getPendingEmployeesService = require("../services/employee/get-pending-employees.service");
const approveEmployeeService = require("../services/employee/approve-employee.service");
const rejectEmployeeService = require("../services/employee/reject-employee.service");
const getDoctorsService = require("../services/employee/get-doctors.service");
const updateDoctorAvailabilityService = require("../services/employee/update-doctor-availability.service");
const getDoctorAvailabilityService = require("../services/employee/get-doctor-availability.service");
const asyncHandler = require("../utils/asyncHandler");
const ERR = require("../utils/errors");
const { getPagination, getPaginationMeta } = require("../utils/pagination");

// Create a new employee
const createEmployee = asyncHandler(async (req, res) => {
  const employee = await registerEmployee(req.body, req.user);

  return res.status(201).json({
    success: true,
    message: "Employee registered successfully",
    data: employee,
  });
});

// Get all employees
const getEmployees = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort, search, status } = getPagination(req.query, {
    allowedSortFields: ["createdAt", "joiningDate", "name", "employeeCode"],
    defaultSort: { createdAt: -1 },
  });

  const { employees, total } = await getEmployeesService({
    skip,
    limit,
    sort,
    search,
    status,
  });

  return res.status(200).json({
    success: true,
    message: "Employees retrieved successfully",
    data: employees,
    pagination: getPaginationMeta({
      page,
      limit,
      total,
    }),
  });
});

// Get employee details by ID
const getEmployeeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ERR.invalidEmployeeId();
  }

  const employee = await getEmployeeByIdService(id);

  if (!employee) {
    throw ERR.employeeNotFound();
  }

  return res.status(200).json({
    success: true,
    message: "Employee retrieved successfully",
    data: employee,
  });
});

// Update employee information
const updateEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ERR.invalidEmployeeId();
  }

  const { email, employeeCode, ...updateData } = req.body;

  const employee = await updateEmployeeService(id, updateData);

  if (!employee) {
    throw ERR.employeeNotFound();
  }

  return res.status(200).json({
    success: true,
    message: "Employee updated successfully",
    data: employee,
  });
});

// Soft delete employee
const deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ERR.invalidEmployeeId();
  }

  await deleteEmployeeService(id, req.user.userId);

  return res.status(200).json({
    success: true,
    message: "Employee deleted successfully",
  });
});

// Deactivate employee account
const deactivateEmployee = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw ERR.invalidEmployeeId();
  }

  await deactivateEmployeeService(req.params.id, req.user.userId);
  return res.status(200).json({
    success: true,
    message: "Employee deactivated successfully",
  });
});

// Activate employee account
const activateEmployee = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw ERR.invalidEmployeeId();
  }

  await activateEmployeeService(req.params.id, req.user.userId);
  return res.status(200).json({
    success: true,
    message: "Employee activated successfully",
  });
});

// Get all employees waiting for approval
const getPendingEmployees = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort, search } = getPagination(req.query, {
    allowedSortFields: ["createdAt", "joiningDate", "name", "employeeCode"],
    defaultSort: { createdAt: -1 },
  });

  const { employees, total } = await getPendingEmployeesService({
    skip,
    limit,
    sort,
    search,
  });

  return res.status(200).json({
    success: true,
    message: "Pending employees retrieved successfully",
    data: employees,
    pagination: getPaginationMeta({
      page,
      limit,
      total,
    }),
  });
});

// Approve employee registration
const approveEmployee = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw ERR.invalidEmployeeId();
  }

  const employee = await approveEmployeeService(
    req.params.id,
    req.body.consultationFee,
    req.user.userId,
  );

  return res.status(200).json({
    success: true,
    message: "Employee approved successfully",
    data: employee,
  });
});

// Reject employee registration
const rejectEmployee = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw ERR.invalidEmployeeId();
  }

  await rejectEmployeeService(req.params.id, req.user.userId);
  return res.status(200).json({
    success: true,
    message: "Employee rejected successfully",
  });
});

// Get list of doctors
const getDoctors = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort, search, status } = getPagination(req.query, {
    allowedSortFields: ["createdAt", "joiningDate", "name", "department"],
    defaultSort: { name: 1 },
  });

  const { doctors, total } = await getDoctorsService({
    skip,
    limit,
    sort,
    search,
    status,
  });

  return res.status(200).json({
    success: true,
    message: "Doctors retrieved successfully",
    data: doctors,
    pagination: getPaginationMeta({
      page,
      limit,
      total,
    }),
  });
});

// Update doctor's availability schedule
const updateDoctorAvailability = asyncHandler(async (req, res) => {
  const doctor = await updateDoctorAvailabilityService(
    req.user.userId,
    req.body,
  );

  return res.status(200).json({
    success: true,
    message: "Doctor availability updated successfully",
    data: doctor,
  });
});

// Get doctor's current availability
const getDoctorAvailability = asyncHandler(async (req, res) => {
  const availability = await getDoctorAvailabilityService(req.user.userId);

  return res.status(200).json({
    success: true,
    message: "Doctor availability retrieved successfully",
    data: availability,
  });
});

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  deactivateEmployee,
  activateEmployee,
  getPendingEmployees,
  approveEmployee,
  rejectEmployee,
  getDoctors,
  updateDoctorAvailability,
  getDoctorAvailability,
};
