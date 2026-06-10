const mongoose = require("mongoose");

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

// Create a new employee
const createEmployee = async (req, res) => {
  try {
    const employee = await registerEmployee(req.body);

    return res.status(201).json({
      success: true,
      message: "Employee registered successfully",
      data: employee,
    });
  } catch (error) {
    console.error("CREATE EMPLOYEE ERROR:", error);

    if (error.message?.includes("already exists")) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to register employee",
    });
  }
};

// Get all employees
const getEmployees = async (req, res) => {
  try {
    const employees = await getEmployeesService();

    return res.status(200).json({
      success: true,
      message: "Employees retrieved successfully",
      data: employees,
    });
  } catch (error) {
    console.error("GET EMPLOYEES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve employees",
    });
  }
};

// Get employee details by ID
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID",
      });
    }

    const employee = await getEmployeeByIdService(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee retrieved successfully",
      data: employee,
    });
  } catch (error) {
    console.error("GET EMPLOYEE BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve employee",
    });
  }
};

// Update employee information
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID",
      });
    }

    const { email, employeeCode, ...updateData } = req.body;

    const employee = await updateEmployeeService(id, updateData);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    console.error("UPDATE EMPLOYEE ERROR:", error);

    return res
      .status(error.message?.includes("already exists") ? 409 : 500)
      .json({
        success: false,
        message: error.message,
      });
  }
};

// Deactivate employee account
const deactivateEmployee = async (req, res) => {
  try {
    await deactivateEmployeeService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Employee deactivated successfully",
    });
  } catch (error) {
    console.error("DEACTIVATE EMPLOYEE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate employee",
    });
  }
};

// Activate employee account
const activateEmployee = async (req, res) => {
  try {
    await activateEmployeeService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Employee activated successfully",
    });
  } catch (error) {
    console.error("ACTIVATE EMPLOYEE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to activate employee",
    });
  }
};

// Get all employees waiting for approval
const getPendingEmployees = async (req, res) => {
  try {
    const employees = await getPendingEmployeesService();

    return res.status(200).json({
      success: true,
      message: "Pending employees retrieved successfully",
      data: employees,
    });
  } catch (error) {
    console.error("GET PENDING EMPLOYEES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve pending employees",
    });
  }
};

// Approve employee registration
const approveEmployee = async (req, res) => {
  try {
    const employee = await approveEmployeeService(
      req.params.id,
      req.body.consultationFee
    );

    return res.status(200).json({
      success: true,
      message: "Employee approved successfully",
      data: employee,
    });
  } catch (error) {
    console.error("APPROVE EMPLOYEE ERROR:", error);

    return res.status(error.message?.includes("required") ? 400 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reject employee registration
const rejectEmployee = async (req, res) => {
  try {
    await rejectEmployeeService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Employee rejected successfully",
    });
  } catch (error) {
    console.error("REJECT EMPLOYEE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject employee",
    });
  }
};

// Get list of doctors
const getDoctors = async (req, res) => {
  try {
    const doctors = await getDoctorsService();

    return res.status(200).json({
      success: true,
      message: "Doctors retrieved successfully",
      data: doctors,
    });
  } catch (error) {
    console.error("GET DOCTORS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve doctors",
    });
  }
};

// Update doctor's availability schedule
const updateDoctorAvailability = async (req, res) => {
  try {
    const doctor = await updateDoctorAvailabilityService(
      req.user.userId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Doctor availability updated successfully",
      data: doctor,
    });
  } catch (error) {
    console.error("UPDATE DOCTOR AVAILABILITY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get doctor's current availability
const getDoctorAvailability = async (req, res) => {
  try {
    const availability = await getDoctorAvailabilityService(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Doctor availability retrieved successfully",
      data: availability,
    });
  } catch (error) {
    console.error("GET DOCTOR AVAILABILITY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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
};