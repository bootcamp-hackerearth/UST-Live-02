const Patient = require("../models/Patients");
const Appointment = require("../models/Appointments");
const User = require("../models/Users");
const Employee = require("../models/Employees");
const ProfileChangeRequest = require("../models/ProfileChangeRequests");
const resolveActor = require("../utils/resolveActor");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/apiResponse");
const STATUS = require("../constants/statusCodes");
const MESSAGES = require("../constants/messages");

// Today's [start, end) window in hospital-local time
const todayRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return { today, tomorrow };
};

// Admin/Owner overview stats. Fields mirror exactly what the Angular overview
// renders (active employees, pending approvals, total patients, booked
// appointments) so the consolidated single call returns identical numbers to
// the previous ~6 separate list calls. OWNER additionally counts ADMIN users.
exports.getAdminDashboardStats = async (req, res) => {
    const { designation } = await resolveActor(req.user);
    const includeAdmins = designation === "OWNER";

    const [activeStaff, adminCount, pendingStaff, pendingChanges, totalPatients, bookedAppointments] =
        await Promise.all([
            User.countDocuments({ roles: "STAFF", status: "ACTIVE" }),
            includeAdmins ? User.countDocuments({ roles: "ADMIN" }) : Promise.resolve(0),
            User.countDocuments({ roles: "STAFF", status: "PENDING" }),
            ProfileChangeRequest.countDocuments({ status: "PENDING" }),
            Patient.countDocuments({}),
            Appointment.countDocuments({ status: "BOOKED" }),
        ]);

    return sendSuccess(res, STATUS.OK, MESSAGES.DASHBOARD.ADMIN_STATS_RETRIEVED, {
        stats: {
            activeEmployees: activeStaff + adminCount,
            pendingApprovals: pendingStaff + pendingChanges,
            totalPatients,
            bookedAppointments,
        },
    });
};

// Receptionist overview stats: total patients + all booked appointments.
exports.getReceptionistDashboardStats = async (req, res) => {
    const [totalPatients, bookedAppointments] = await Promise.all([
        Patient.countDocuments({}),
        Appointment.countDocuments({ status: "BOOKED" }),
    ]);

    return sendSuccess(res, STATUS.OK, MESSAGES.DASHBOARD.RECEPTIONIST_STATS_RETRIEVED, {
        stats: { totalPatients, bookedAppointments },
    });
};

// Doctor overview stats for the authenticated doctor:
//   today    = appointments on today's date
//   upcoming = BOOKED appointments after today
//   pastDue  = BOOKED appointments before today, OR today whose slot end time
//              has already passed (computed via the timeSlot end instant)
exports.getDoctorDashboardStats = async (req, res) => {
    const doctorEmployeeId = req.user.employeeCode;
    const { today: dayStart, tomorrow: dayEnd } = todayRange();
    const nowMs = Date.now();

    const [todayCount, upcomingCount, pastDueAgg] = await Promise.all([
        Appointment.countDocuments({
            doctorEmployeeId,
            appointmentDate: { $gte: dayStart, $lt: dayEnd },
        }),
        Appointment.countDocuments({
            doctorEmployeeId,
            status: "BOOKED",
            appointmentDate: { $gte: dayEnd },
        }),
        Appointment.aggregate([
            { $match: { doctorEmployeeId, status: "BOOKED" } },
            {
                $addFields: {
                    // minutes-into-day of the slot end time ("HH:mm-HH:mm" -> end "HH:mm")
                    slotEndMinutes: {
                        $let: {
                            vars: {
                                hm: {
                                    $split: [
                                        { $arrayElemAt: [{ $split: ["$timeSlot", "-"] }, 1] },
                                        ":",
                                    ],
                                },
                            },
                            in: {
                                $add: [
                                    { $multiply: [{ $toInt: { $arrayElemAt: ["$$hm", 0] } }, 60] },
                                    { $toInt: { $arrayElemAt: ["$$hm", 1] } },
                                ],
                            },
                        },
                    },
                },
            },
            {
                $addFields: {
                    slotEndInstant: {
                        $add: [
                            { $toLong: "$appointmentDate" },
                            { $multiply: ["$slotEndMinutes", 60000] },
                        ],
                    },
                },
            },
            {
                $match: {
                    $expr: {
                        $or: [
                            { $lt: ["$appointmentDate", dayStart] },
                            {
                                $and: [
                                    { $gte: ["$appointmentDate", dayStart] },
                                    { $lt: ["$appointmentDate", dayEnd] },
                                    { $lt: ["$slotEndInstant", nowMs] },
                                ],
                            },
                        ],
                    },
                },
            },
            { $count: "count" },
        ]),
    ]);

    return sendSuccess(res, STATUS.OK, MESSAGES.DASHBOARD.DOCTOR_STATS_RETRIEVED, {
        stats: {
            today: todayCount,
            upcoming: upcomingCount,
            pastDue: pastDueAgg[0]?.count || 0,
        },
    });
};

// Role-aware dispatcher (GET /api/dashboard/stats). Dispatches on the actor's
// DESIGNATION (resolved from the Employee record) — roles[] only holds
// OWNER/ADMIN/STAFF, so designation is what distinguishes doctor vs receptionist.
exports.getDashboardStats = async (req, res) => {
    const { designation } = await resolveActor(req.user);

    if (designation === "OWNER" || designation === "ADMIN") {
        return exports.getAdminDashboardStats(req, res);
    }
    if (designation === "DOCTOR") {
        return exports.getDoctorDashboardStats(req, res);
    }
    if (designation === "RECEPTIONIST") {
        return exports.getReceptionistDashboardStats(req, res);
    }
    throw new AppError(STATUS.FORBIDDEN, MESSAGES.DASHBOARD.UNAUTHORIZED);
};

// Get Appointment Statistics
exports.getAppointmentStats = async (req, res) => {

    const { startDate, endDate } = req.query;

    let filter = {};
    if (startDate && endDate) {
        filter.appointmentDate = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const total = await Appointment.countDocuments(filter);
    const completed = await Appointment.countDocuments({ ...filter, status: 'COMPLETED' });
    const booked = await Appointment.countDocuments({ ...filter, status: 'BOOKED' });
    const canceled = await Appointment.countDocuments({ ...filter, status: 'CANCELED' });

    return sendSuccess(res, STATUS.OK, MESSAGES.DASHBOARD.APPOINTMENT_STATS_RETRIEVED, {
        stats: {
            total,
            completed,
            booked,
            canceled,
            completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) + '%' : '0%'
        }
    });
};

// Get Patient Statistics
exports.getPatientStats = async (req, res) => {

    const total = await Patient.countDocuments({ status: 'ACTIVE' });
    const inactive = await Patient.countDocuments({ status: 'INACTIVE' });
    const byGender = await Patient.aggregate([
        { $match: { status: 'ACTIVE' } },
        { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    return sendSuccess(res, STATUS.OK, MESSAGES.DASHBOARD.PATIENT_STATS_RETRIEVED, {
        stats: {
            total,
            active: total,
            inactive,
            byGender
        }
    });
};

// Get Employee Statistics
exports.getEmployeeStats = async (req, res) => {

    const total = await User.countDocuments({ roles: 'STAFF' });
    const active = await User.countDocuments({ roles: 'STAFF', status: 'ACTIVE' });
    const pending = await User.countDocuments({ roles: 'STAFF', status: 'PENDING' });
    const inactive = await User.countDocuments({ roles: 'STAFF', status: 'INACTIVE' });

    // By designation
    const byDesignation = await Employee.aggregate([
        { $group: { _id: '$designation', count: { $sum: 1 } } }
    ]);

    // By department
    const byDepartment = await Employee.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    return sendSuccess(res, STATUS.OK, MESSAGES.DASHBOARD.EMPLOYEE_STATS_RETRIEVED, {
        stats: {
            total,
            active,
            pending,
            inactive,
            byDesignation,
            byDepartment
        }
    });
};
