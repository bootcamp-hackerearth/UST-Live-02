const Employee = require("../../models/Employee");
const STATUS = require("../../constants/status");

const getDoctorsService = async () => {
  return Employee.find({
    designation: "DOCTOR",
    status: STATUS.ACTIVE,
    isDeleted: false,
  })
    .select("name department specialization availability consultationFee joiningDate")
    .sort({
      name: 1,
    })
    .lean();
};

module.exports = getDoctorsService;
