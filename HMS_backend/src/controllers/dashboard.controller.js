const getAdminStatsService = require("../services/dashboard/get-admin-stats.service");
const getRecentEmployeesService = require("../services/dashboard/get-recent-employees.service");
const getDoctorStatsService = require("../services/dashboard/get-doctor-stats.service");
const getReceptionistStatsService = require("../services/dashboard/get-receptionist-stats.service");
const getTodayAppointmentsService = require("../services/dashboard/get-today-appointments.service");
const asyncHandler = require("../utils/asyncHandler");

const getAdminStats = asyncHandler(async (req, res) => {
  const stats = await getAdminStatsService();

  return res.status(200).json({
    success: true,
    message: "Admin dashboard statistics retrieved successfully",
    data: stats,
  });
});

const getRecentEmployees = asyncHandler(async (req, res) => {
  const employees = await getRecentEmployeesService();

  return res.status(200).json({
    success: true,
    message: "Recent employees retrieved successfully",
    data: employees,
  });
});
const getDoctorStats = asyncHandler(async (req, res) => {
  const stats = await getDoctorStatsService(req.user.employeeId);

  return res.status(200).json({
    success: true,
    message: "Doctor dashboard statistics retrieved successfully",
    data: stats,
  });
});
const getReceptionistStats = asyncHandler(async (req, res) => {
  const stats = await getReceptionistStatsService();

  return res.status(200).json({
    success: true,
    message: "Receptionist dashboard statistics retrieved successfully",
    data: stats,
  });
});

const getTodayAppointments = asyncHandler(async (req, res) => {
  const appointments = await getTodayAppointmentsService(req.user);

  return res.status(200).json({
    success: true,
    message: "Appointments retrieved successfully",
    data: appointments,
  });
});

module.exports = {
  getAdminStats,
  getRecentEmployees,
  getDoctorStats,
  getReceptionistStats,
  getTodayAppointments,
};