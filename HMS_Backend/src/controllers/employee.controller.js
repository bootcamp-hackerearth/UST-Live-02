const mongoose = require("mongoose");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const registerEmployee = require("../services/employee/register-employee.service");
const getEmployeesService = require("../services/employee/get-employees.service");
const getEmployeeByIdService = require("../services/employee/get-employee-by-id.service");
const updateEmployeeService = require("../services/employee/update-employee.service");
const activateEmployeeService = require("../services/employee/activate-employee.service");
const deactivateEmployeeService = require("../services/employee/deactivate-employee.service");
const getPendingEmployeesService = require("../services/employee/get-pending-employees.service");
const approveEmployeeService = require("../services/employee/approve-employee.service");
const rejectEmployeeService = require("../services/employee/reject-employee.service");
const getDoctorsService = require("../services/employee/get-doctors.service");
const updateDoctorAvailabilityService = require("../services/employee/update-doctor-availability.service");
const getDoctorAvailabilityService = require("../services/employee/get-doctor-availability.service");
const deleteEmployeeService = require("../services/employee/delete-employee.service");

const validateObjectId = (id, message) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, message, "INVALID_ID");
  }
};

const createEmployee = asyncHandler(async (req, res) => {
  const employee = await registerEmployee(req.body, req.user);

  return res
    .status(201)
    .json(new ApiResponse(201, "Employee registered successfully", employee));
});

const getEmployees = asyncHandler(async (req, res) => {
  const result = await getEmployeesService(req.query);

  return res.status(200).json({
    ...new ApiResponse(200, "Employees retrieved successfully", result.data),
    meta: result.meta,
  });
});

const getEmployeeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateObjectId(id, "Invalid employee ID");

  const employee = await getEmployeeByIdService(id);

  if (!employee) {
    throw new ApiError(404, "Employee not found", "EMPLOYEE_NOT_FOUND");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Employee retrieved successfully", employee));
});

const updateEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateObjectId(id, "Invalid employee ID");

  const { email, employeeCode, ...updateData } = req.body;
  const employee = await updateEmployeeService(id, updateData, req.user.userId);

  if (!employee) {
    throw new ApiError(404, "Employee not found", "EMPLOYEE_NOT_FOUND");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Employee updated successfully", employee));
});

const deactivateEmployee = asyncHandler(async (req, res) => {
  await deactivateEmployeeService(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Employee deactivated successfully"));
});

const activateEmployee = asyncHandler(async (req, res) => {
  await activateEmployeeService(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Employee activated successfully"));
});

const getPendingEmployees = asyncHandler(async (req, res) => {
  const employees = await getPendingEmployeesService();

  return res
    .status(200)
    .json(new ApiResponse(200, "Pending employees retrieved successfully", employees));
});

const approveEmployee = asyncHandler(async (req, res) => {
  const employee = await approveEmployeeService(
    req.params.id,
    req.body.consultationFee,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Employee approved successfully", employee));
});

const rejectEmployee = asyncHandler(async (req, res) => {
  await rejectEmployeeService(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Employee rejected successfully"));
});

const getDoctors = asyncHandler(async (req, res) => {
  const doctors = await getDoctorsService();

  return res
    .status(200)
    .json(new ApiResponse(200, "Doctors retrieved successfully", doctors));
});

const updateDoctorAvailability = asyncHandler(async (req, res) => {
  const doctor = await updateDoctorAvailabilityService(req.user.userId, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, "Doctor availability updated successfully", doctor));
});

const getDoctorAvailability = asyncHandler(async (req, res) => {
  const availability = await getDoctorAvailabilityService(req.user.userId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Doctor availability retrieved successfully",
        availability,
      ),
    );
});

const deleteEmployee = asyncHandler(async (req, res) => {
  const result = await deleteEmployeeService(req.params.id, req.user.userId);

  return res.status(200).json(new ApiResponse(200, result.message, result));
});

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deactivateEmployee,
  activateEmployee,
  getPendingEmployees,
  approveEmployee,
  rejectEmployee,
  getDoctors,
  updateDoctorAvailability,
  getDoctorAvailability,
  deleteEmployee,
};
