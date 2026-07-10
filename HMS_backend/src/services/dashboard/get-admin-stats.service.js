const Employee = require("../../models/Employee");
const STATUS = require("../../constants/status");

const getAdminStatsService = async () => {
  const filter = {
    isDeleted: false,
  };
  const totalEmployees = await Employee.countDocuments(filter);

  const totalDoctors = await Employee.countDocuments({
    ...filter,
    designation: "DOCTOR",
  });

  const totalNurses = await Employee.countDocuments({
    ...filter,
    designation: "NURSE",
  });

  const pendingRequests = await Employee.countDocuments({
    ...filter,
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
