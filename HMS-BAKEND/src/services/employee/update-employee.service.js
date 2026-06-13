const Employee = require("../../models/Employee");

const updateEmployeeService = async (
  employeeId,
  updateData
) => {

  if (updateData.medicalRegistrationNo) {

    const existingDoctor =
      await Employee.findOne({
        medicalRegistrationNo:
          updateData.medicalRegistrationNo,
        _id: { $ne: employeeId },
      });

    if (existingDoctor) {
      throw new Error(
        "Medical registration number already exists"
      );
    }
  }

  const employee =
    await Employee.findByIdAndUpdate(
      employeeId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

  return employee;
};

module.exports = updateEmployeeService;