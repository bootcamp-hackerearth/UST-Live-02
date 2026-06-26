const Employee = require("../../models/Employee");
const STATUS = require("../../constants/status");

const getAdminStatsService = async () => {
  const totalEmployees = await Employee.countDocuments({
    isDeleted: { $ne: true },
  });

  const totalDoctors = await Employee.countDocuments({
    designation: "DOCTOR",
    isDeleted: { $ne: true },
  });

  const totalNurses = await Employee.countDocuments({
    designation: "NURSE",
    isDeleted: { $ne: true },
  });

  const pendingRequests = await Employee.countDocuments({
    status: STATUS.PENDING,
    isDeleted: { $ne: true },
  });

  return {
    totalEmployees,
    totalDoctors,
    totalNurses,
    pendingRequests,
  };
};

module.exports = getAdminStatsService;

