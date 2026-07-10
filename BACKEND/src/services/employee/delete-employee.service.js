const Employee = require("../../models/Employee");
const Appointment = require("../../models/Appointment");

const STATUS = require("../../constants/status");

const cancelFutureDoctorAppointments = require("../appointment/cancel-future-doctor-appointments.service");
const User = require("../../models/User");
const ApiError = require("../../utils/ApiError");

const deleteEmployeeService = async (employeeId, deletedBy) => {
  const employee = await Employee.findOne({
    _id: employeeId,
    isDeleted: false,
  });

  if (!employee) {
    throw new ApiError(404, "Employee not found", "EMPLOYEE_NOT_FOUND");
  }

  employee.isDeleted = true;
  employee.deletedBy = deletedBy;
  employee.deletedAt = new Date();

  await employee.save();
  if (employee.designation === "DOCTOR") {
    await cancelFutureDoctorAppointments(employee._id, deletedBy);
  }

  await User.findOneAndUpdate(
    {
      employeeId,
      isDeleted: false,
    },
    {
      isDeleted: true,
      deletedBy,
      deletedAt: new Date(),
    },
  );

  return {
    message: "Employee deleted successfully",
  };
};

module.exports = deleteEmployeeService;
