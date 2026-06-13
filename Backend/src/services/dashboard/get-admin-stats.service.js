const Employee = require("../../models/Employee");
const STATUS = require("../../constants/status");

const getAdminStatsService = async () => {
  const totalEmployees = await Employee.countDocuments();

  const totalDoctors = await Employee.countDocuments({
    designation: "DOCTOR",
  });

  const totalNurses = await Employee.countDocuments({
    designation: "NURSE",
  });

  const pendingRequests = await Employee.countDocuments({
    status: STATUS.PENDING,
  });

  return {
    totalEmployees,
    totalDoctors,
    totalNurses,
    pendingRequests,
  };
};

module.exports = getAdminStatsService;
