const Employee = require("../../models/Employee");
const ERR = require("../../utils/errors");

const updateEmployeeService = async (employeeId, updateData) => {
  if (updateData.medicalRegistrationNo) {
    const existingDoctor = await Employee.findOne({
      medicalRegistrationNo: updateData.medicalRegistrationNo,
      _id: { $ne: employeeId },
      isDeleted: { $ne: true },
    });

    if (existingDoctor) {
      throw ERR.medicalRegistrationExists();
    }
  }

  const employee = await Employee.findOneAndUpdate(
    {
      _id: employeeId,
      isDeleted: { $ne: true },
    },
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  return employee;
};

module.exports = updateEmployeeService;

