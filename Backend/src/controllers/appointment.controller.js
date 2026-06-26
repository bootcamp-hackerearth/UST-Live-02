const Appointment = require("../models/Appointment");
const mongoose = require("mongoose");
const getAvailableSlotsService = require("../services/appointment/get-available-slots.service");
const bookAppointmentService = require("../services/appointment/book-appointment.service");
const bookPatientAppointmentService = require("../services/appointment/book-patient-appointment.service");
const getMyAppointmentsService = require("../services/appointment/get-my-appointments.service");
const getPendingAppointmentsService = require("../services/appointment/get-pending-appointments.service");
const getAppointmentSearchFilter = require("../services/appointment/get-appointment-search-filter.service");
const approveAppointmentService = require("../services/appointment/approve-appointment.service");
const rejectAppointmentService = require("../services/appointment/reject-appointment.service");
const updateMyAppointmentService = require("../services/appointment/update-my-appointment.service");
const cancelMyAppointmentService = require("../services/appointment/cancel-my-appointment.service");
const asyncHandler = require("../utils/asyncHandler");
const ERR = require("../utils/errors");
const {
  getPagination,
  getPaginationMeta,
  buildDateRangeFilter,
} = require("../utils/pagination");


const getAvailableSlots = asyncHandler(async (req, res) => {
  const { doctorId, appointmentDate } = req.query;

  const availableSlots = await getAvailableSlotsService(
    doctorId,
    appointmentDate,
  );

  return res.status(200).json({
    success: true,
    data: availableSlots,
  });
});

const bookAppointment = asyncHandler(async (req, res) => {
  const appointment = await bookAppointmentService(req.body, req.user);

  return res.status(201).json({
    success: true,
    message: "Appointment booked successfully",
    data: appointment,
  });
});

const bookPatientAppointment = asyncHandler(async (req, res) => {
  const appointment = await bookPatientAppointmentService(req.body, req.user);

  return res.status(201).json({
    success: true,
    message: "Appointment request submitted successfully",
    data: appointment,
  });
});

const getAppointments = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort, search, status, fromDate, toDate } =
    getPagination(req.query, {
      allowedSortFields: [
        "createdAt",
        "appointmentDate",
        "appointmentId",
        "tokenNumber",
        "status",
      ],
      defaultSort: { appointmentDate: 1, timeSlot: 1 },
    });

  const filter = {
    isDeleted: { $ne: true },
  };

  if (req.user.roles?.includes("DOCTOR")) {
    filter.doctorEmployeeId = req.user.employeeId;
  }

  if (req.user.roles?.includes("PATIENT")) {
    filter.patientId = req.user.patientId;
  }

  if (search) {
    Object.assign(filter, await getAppointmentSearchFilter(search));
  }

  if (status) {
    filter.status = status;
  }

  Object.assign(
    filter,
    buildDateRangeFilter("appointmentDate", fromDate, toDate)
  );

  const total = await Appointment.countDocuments(filter);

  const appointments = await Appointment.find(filter)
    .populate("patientId")
    .populate("doctorEmployeeId")
    .sort(sort)
    .skip(skip)
    .limit(limit);

  return res.status(200).json({
    success: true,
    data: appointments,
    pagination: getPaginationMeta({
      page,
      limit,
      total,
    }),
  });
});

const deleteAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ERR.invalidAppointmentId();
  }

  const appointment = await Appointment.findOne({
    _id: id,
    isDeleted: { $ne: true },
  });

  if (!appointment) {
    throw ERR.appointmentNotFoundById();
  }

  if (req.user.roles?.includes("PATIENT")) {
    if (appointment.patientId.toString() !== req.user.patientId.toString()) {
      throw ERR.unauthorized();
    }
  }

  appointment.isDeleted = true;
  appointment.deletedBy = req.user.userId;
  appointment.deletedDate = new Date();

  await appointment.save();

  return res.status(200).json({
    success: true,
    message: "Appointment deleted successfully",
  });
});

const getAppointmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ERR.invalidAppointmentId();
  }

  const appointment = await Appointment.findOne({
    _id: id,
    isDeleted: { $ne: true },
  })
    .populate("patientId")
    .populate("doctorEmployeeId");

  if (!appointment) {
    throw ERR.appointmentNotFoundById();
  }

  return res.status(200).json({
    success: true,
    data: appointment,
  });
});

const updateAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ERR.invalidAppointmentId();
  }

  const {
    doctorEmployeeId,
    appointmentDate,
    timeSlot,
    appointmentType,
    priority,
    paymentStatus,
    visitMode,
    status,
    reason,
    notes,
    symptoms,
  } = req.body;

  const appointment = await Appointment.findOne({
    _id: id,
    isDeleted: { $ne: true },
  });

  if (!appointment) {
    throw ERR.appointmentNotFound();
  }

  if (appointmentDate) {
    const [year, month, day] = appointmentDate.split("-").map(Number);

    const selectedDate = new Date(year, month - 1, day);
    selectedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      throw ERR.appointmentDatePast();
    }
  }

  const updatedDoctorId = doctorEmployeeId || appointment.doctorEmployeeId;

  const updatedAppointmentDate = appointmentDate || appointment.appointmentDate;

  const updatedTimeSlot = timeSlot || appointment.timeSlot;

  const conflictingAppointment = await Appointment.findOne({
    _id: { $ne: id },
    isDeleted: { $ne: true },
    doctorEmployeeId: updatedDoctorId,
    appointmentDate: updatedAppointmentDate,
    timeSlot: updatedTimeSlot,
  });

  if (conflictingAppointment) {
    throw ERR.timeSlotAlreadyBooked();
  }

  let formattedDate = appointment.appointmentDate;

  if (appointmentDate) {
    formattedDate = appointmentDate;
  }

  Object.assign(appointment, {
    doctorEmployeeId,
    appointmentDate: formattedDate,
    timeSlot,
    appointmentType,
    priority,
    paymentStatus,
    visitMode,
    status,
    reason,
    notes,
    symptoms,
  });

  await appointment.save();

  return res.status(200).json({
    success: true,
    message: "Appointment updated successfully",
    data: appointment,
  });
});

const getDoctorQueue = asyncHandler(async (req, res) => {
  const { doctorEmployeeId } = req.query;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const appointments = await Appointment.find({
    doctorEmployeeId,
    isDeleted: { $ne: true },
    appointmentDate: {
      $gte: today,
      $lt: tomorrow,
    },
  })
    .populate("patientId")
    .sort({ tokenNumber: 1 });

  return res.status(200).json({
    success: true,
    message:
      appointments.length > 0
        ? "Doctor queue retrieved successfully"
        : "No appointments found in doctor's queue",
    data: appointments,
  });
});

//Patient can see only there appointments
const getMyAppointments = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort, search, status, fromDate, toDate } =
    getPagination(req.query, {
      allowedSortFields: ["createdAt", "appointmentDate", "appointmentId", "status"],
      defaultSort: { appointmentDate: -1 },
    });

  const { appointments, total } = await getMyAppointmentsService(
    req.user.patientId,
    {
      skip,
      limit,
      sort,
      search,
      status,
      fromDate,
      toDate,
    }
  );

  return res.status(200).json({
    success: true,
    data: appointments,
    pagination: getPaginationMeta({
      page,
      limit,
      total,
    }),
  });
});

// Pending Appointments
const getPendingAppointments = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort, search, fromDate, toDate } = getPagination(
    req.query,
    {
      allowedSortFields: ["createdAt", "appointmentDate", "appointmentId"],
      defaultSort: { createdAt: -1 },
    }
  );

  const { appointments, total } = await getPendingAppointmentsService({
    skip,
    limit,
    sort,
    search,
    fromDate,
    toDate,
  });

  return res.status(200).json({
    success: true,
    data: appointments,
    pagination: getPaginationMeta({
      page,
      limit,
      total,
    }),
  });
});

// Appointment approval
const approveAppointment = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw ERR.invalidAppointmentId();
  }

  const appointment = await approveAppointmentService(
    req.params.id,
    req.user.userId
  );

  return res.status(200).json({
    success: true,
    message: "Appointment approved successfully",
    data: appointment,
  });
});

// Reject appointment
const rejectAppointment = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw ERR.invalidAppointmentId();
  }

  const appointment = await rejectAppointmentService(
    req.params.id,
    req.user.userId
  );

  return res.status(200).json({
    success: true,
    message: "Appointment rejected successfully",
    data: appointment,
  });
});

// Update Appointment
const updateMyAppointment = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw ERR.invalidAppointmentId();
  }

  const appointment = await updateMyAppointmentService(
    req.params.id,
    req.user.patientId,
    req.body,
  );

  return res.status(200).json({
    success: true,
    message: "Appointment updated successfully",
    data: appointment,
  });
});

// Cancel Appointment
const cancelMyAppointment = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw ERR.invalidAppointmentId();
  }

  const appointment = await cancelMyAppointmentService(
    req.params.id,
    req.user.patientId,
  );

  return res.status(200).json({
    success: true,
    message: "Appointment cancelled successfully",
    data: appointment,
  });
});

module.exports = {
  getAvailableSlots,
  bookAppointment,
  getAppointments,
  deleteAppointment,
  getAppointmentById,
  updateAppointment,
  getDoctorQueue,
  bookPatientAppointment,
  getMyAppointments,
  getPendingAppointments,
  approveAppointment,
  rejectAppointment,
  updateMyAppointment,
  cancelMyAppointment,
};

