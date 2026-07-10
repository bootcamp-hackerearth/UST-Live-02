const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const getAdminStatsService = require("../services/dashboard/get-admin-stats.service");
const getRecentEmployeesService = require("../services/dashboard/get-recent-employees.service");
const getDoctorStatsService = require("../services/dashboard/get-doctor-stats.service");
const getReceptionistStatsService = require("../services/dashboard/get-receptionist-stats.service");
const getTodayAppointmentsService = require("../services/dashboard/get-today-appointments.service");

const getAdminStats = asyncHandler(async (req, res) => {
  const stats = await getAdminStatsService();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Admin dashboard statistics retrieved successfully",
        stats,
      ),
    );
});

const getRecentEmployees = asyncHandler(async (req, res) => {
  const employees = await getRecentEmployeesService();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Recent employees retrieved successfully",
        employees,
      ),
    );
});

const getDoctorStats = asyncHandler(async (req, res) => {
  const stats = await getDoctorStatsService(req.user.employeeId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Doctor dashboard statistics retrieved successfully",
        stats,
      ),
    );
});

const getReceptionistStats = asyncHandler(async (req, res) => {
  const stats = await getReceptionistStatsService();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Receptionist dashboard statistics retrieved successfully",
        stats,
      ),
    );
});

const getTodayAppointments = asyncHandler(async (req, res) => {
  const appointments = await getTodayAppointmentsService(req.user);

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Appointments retrieved successfully", appointments),
    );
});

module.exports = {
  getAdminStats,
  getRecentEmployees,
  getDoctorStats,
  getReceptionistStats,
  getTodayAppointments,
};
