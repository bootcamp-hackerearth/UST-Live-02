const Employee = require("../../models/Employee");
const ApiError = require("../../utils/ApiError");

const updateEmployeeService = async (employeeId, updateData, updatedBy) => {
  if (updateData.medicalRegistrationNo) {
    const existingDoctor = await Employee.findOne({
      medicalRegistrationNo: updateData.medicalRegistrationNo,

      _id: {
        $ne: employeeId,
      },

      isDeleted: false,
    });

    if (existingDoctor) {
      throw new ApiError(
        409,
        "Medical registration number already exists",
        "MEDICAL_REGISTRATION_EXISTS",
      );
    }
  }

  const employee = await Employee.findOne({
    _id: employeeId,
    isDeleted: false,
  });

  if (!employee) {
    throw new ApiError(404, "Employee not found", "EMPLOYEE_NOT_FOUND");
  }

  Object.assign(employee, updateData);

  employee.updatedBy = updatedBy;

  await employee.save();

  return employee;
};

module.exports = updateEmployeeService;
