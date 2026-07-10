const Employee = require("../../models/Employee");
const STATUS = require("../../constants/status");

const getDoctorsService = async () => {
  return Employee.find({
    designation: "DOCTOR",
    status: STATUS.ACTIVE,
    isDeleted: { $ne: true },
  })
    .select("name employeeCode department specialization joiningDate availability consultationFee")
    .sort({
      name: 1,
    })
    .lean();
};

module.exports = getDoctorsService;

