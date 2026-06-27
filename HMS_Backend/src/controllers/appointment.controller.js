const mongoose = require("mongoose");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const Appointment = require("../models/Appointment");
const getAvailableSlotsService = require("../services/appointment/get-available-slots.service");
const bookAppointmentService = require("../services/appointment/book-appointment.service");
const bookPatientAppointmentService = require("../services/appointment/book-patient-appointment.service");
const getMyAppointmentsService = require("../services/appointment/get-my-appointments.service");
const getPendingAppointmentsService = require("../services/appointment/get-pending-appointments.service");
const approveAppointmentService = require("../services/appointment/approve-appointment.service");
const rejectAppointmentService = require("../services/appointment/reject-appointment.service");
const updateMyAppointmentService = require("../services/appointment/update-my-appointment.service");
const cancelMyAppointmentService = require("../services/appointment/cancel-my-appointment.service");
const getAppointmentsService = require("../services/appointment/get-appointments.service");

const validateObjectId = (id, message) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, message, "INVALID_ID");
  }
};

const getAvailableSlots = asyncHandler(async (req, res) => {
  const { doctorId, appointmentDate } = req.query;
  const availableSlots = await getAvailableSlotsService(doctorId, appointmentDate);

  return res
    .status(200)
    .json(new ApiResponse(200, "Available slots retrieved successfully", availableSlots));
});

const bookAppointment = asyncHandler(async (req, res) => {
  const appointment = await bookAppointmentService(req.body, req.user);

  return res
    .status(201)
    .json(new ApiResponse(201, "Appointment booked successfully", appointment));
});

const getAppointments = asyncHandler(async (req, res) => {
  const result = await getAppointmentsService(req.user, req.query);

  return res.status(200).json({
    ...new ApiResponse(200, "Appointments retrieved successfully", result.data),
    meta: result.meta,
  });
});

const deleteAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateObjectId(id, "Invalid appointment ID");

  const appointment = await Appointment.findById(id);

  if (!appointment) {
    throw new ApiError(
      404,
      "Appointment not found for the provided ID",
      "APPOINTMENT_NOT_FOUND",
    );
  }

  if (
    req.user.roles?.includes("PATIENT") &&
    appointment.patientId.toString() !== req.user.patientId.toString()
  ) {
    throw new ApiError(403, "Unauthorized", "FORBIDDEN");
  }

  await Appointment.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Appointment deleted successfully"));
});

const getAppointmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateObjectId(id, "Invalid appointment ID");

  const appointment = await Appointment.findById(id)
    .populate("patientId")
    .populate("doctorEmployeeId");

  if (!appointment) {
    throw new ApiError(
      404,
      "Appointment not found for the provided ID",
      "APPOINTMENT_NOT_FOUND",
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Appointment retrieved successfully", appointment));
});

const getMyAppointmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateObjectId(id, "Invalid appointment ID");

  const appointment = await Appointment.findOne({
    _id: id,
    patientId: req.user.patientId,
    isDeleted: false,
  })
    .populate("patientId")
    .populate("doctorEmployeeId");

  if (!appointment) {
    throw new ApiError(
      404,
      "Appointment not found for the provided ID",
      "APPOINTMENT_NOT_FOUND",
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Appointment retrieved successfully", appointment));
});

const updateAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateObjectId(id, "Invalid appointment ID");

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

  const appointment = await Appointment.findById(id);

  if (!appointment) {
    throw new ApiError(404, "Appointment not found", "APPOINTMENT_NOT_FOUND");
  }

  if (appointmentDate) {
    const [year, month, day] = appointmentDate.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day);
    selectedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      throw new ApiError(
        422,
        "Appointment date cannot be in the past",
        "PAST_DATE_NOT_ALLOWED",
      );
    }
  }

  const updatedDoctorId = doctorEmployeeId || appointment.doctorEmployeeId;
  const updatedAppointmentDate = appointmentDate || appointment.appointmentDate;
  const updatedTimeSlot = timeSlot || appointment.timeSlot;

  const conflictingAppointment = await Appointment.findOne({
    _id: { $ne: id },
    doctorEmployeeId: updatedDoctorId,
    appointmentDate: updatedAppointmentDate,
    timeSlot: updatedTimeSlot,
  });

  if (conflictingAppointment) {
    throw new ApiError(
      409,
      "Selected time slot is already booked",
      "SLOT_ALREADY_BOOKED",
    );
  }

  Object.assign(appointment, {
    doctorEmployeeId,
    appointmentDate: appointmentDate || appointment.appointmentDate,
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

  return res
    .status(200)
    .json(new ApiResponse(200, "Appointment updated successfully", appointment));
});

const getDoctorQueue = asyncHandler(async (req, res) => {
  const { doctorEmployeeId } = req.query;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const appointments = await Appointment.find({
    doctorEmployeeId,
    appointmentDate: {
      $gte: today,
      $lt: tomorrow,
    },
    isDeleted: false,
    status: {
      $in: ["BOOKED", "IN_CONSULTATION"],
    },
  })
    .populate("patientId")
    .sort({
      tokenNumber: 1,
    });

  return res.status(200).json(
    new ApiResponse(
      200,
      appointments.length > 0
        ? "Doctor queue retrieved successfully"
        : "No appointments found in doctor's queue",
      appointments,
    ),
  );
});

const bookPatientAppointment = asyncHandler(async (req, res) => {
  const appointment = await bookPatientAppointmentService(req.body, req.user);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "Appointment request submitted successfully",
        appointment,
      ),
    );
});

const getMyAppointments = asyncHandler(async (req, res) => {
  const result = await getMyAppointmentsService(req.user.patientId, req.query);

  return res.status(200).json({
    ...new ApiResponse(200, "Appointments retrieved successfully", result.data),
    meta: result.meta,
  });
});

const getPendingAppointments = asyncHandler(async (req, res) => {
  const appointments = await getPendingAppointmentsService();

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Pending appointments retrieved successfully", appointments),
    );
});

const approveAppointment = asyncHandler(async (req, res) => {
  const appointment = await approveAppointmentService(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Appointment approved successfully", appointment));
});

const rejectAppointment = asyncHandler(async (req, res) => {
  const appointment = await rejectAppointmentService(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Appointment rejected successfully", appointment));
});

const updateMyAppointment = asyncHandler(async (req, res) => {
  const appointment = await updateMyAppointmentService(
    req.params.id,
    req.user.patientId,
    req.body,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Appointment updated successfully", appointment));
});

const cancelMyAppointment = asyncHandler(async (req, res) => {
  const appointment = await cancelMyAppointmentService(
    req.params.id,
    req.user.patientId,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Appointment cancelled successfully", appointment));
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
  getMyAppointmentById,
  getPendingAppointments,
  approveAppointment,
  rejectAppointment,
  updateMyAppointment,
  cancelMyAppointment,
};
