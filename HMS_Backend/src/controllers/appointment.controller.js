const Appointment = require("../models/Appointment");
const mongoose = require("mongoose");
const getAvailableSlotsService = require("../services/appointment/get-available-slots.service");
const bookAppointmentService = require("../services/appointment/book-appointment.service");
const bookPatientAppointmentService =require("../services/appointment/book-patient-appointment.service");
const getMyAppointmentsService =require("../services/appointment/get-my-appointments.service");
const getPendingAppointmentsService =require("../services/appointment/get-pending-appointments.service");
const approveAppointmentService =require( "../services/appointment/approve-appointment.service");
const rejectAppointmentService =require("../services/appointment/reject-appointment.service");
const updateMyAppointmentService =require("../services/appointment/update-my-appointment.service");
const cancelMyAppointmentService =require("../services/appointment/cancel-my-appointment.service");

const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, appointmentDate } = req.query;

    const availableSlots = await getAvailableSlotsService(
      doctorId,
      appointmentDate
    );

    return res.status(200).json({
      success: true,
      data: availableSlots,
    });
  } catch (error) {
    console.error("GET AVAILABLE SLOTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch available appointment slots",
    });
  }
};

const bookAppointment = async (req, res) => {
  try {
    const appointment = await bookAppointmentService(req.body, req.user);

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment,
    });
  } catch (error) {
    console.error("BOOK APPOINTMENT ERROR:", error);

    if (error.message === "Patient not found") {
      return res.status(404).json({
        success: false,
        message: "Patient record not found",
      });
    }

    if (error.message === "Doctor not found") {
      return res.status(404).json({
        success: false,
        message: "Doctor record not found",
      });
    }

    if (error.message === "Slot already booked") {
      return res.status(409).json({
        success: false,
        message: "Selected appointment slot is already booked",
      });
    }

    if (error.message === "Past date not allowed") {
      return res.status(422).json({
        success: false,
        message: "Appointments cannot be booked for past dates",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to book appointment",
    });
  }
};

const getAppointments = async (req, res) => {
  try {
    const filter = {};
// Only to view appointments related to doctor 
    if (req.user.roles?.includes("DOCTOR")) {
      filter.doctorEmployeeId = req.user.employeeId;
    }
    // Only patients view there appointments 
    if (
  req.user.roles?.includes("PATIENT")) {
filter.patientId = req.user.patientId;
}

    const appointments = await Appointment.find(filter)
      .populate("patientId")
      .populate("doctorEmployeeId")
      .sort({
        appointmentDate: 1,
        timeSlot: 1,
      });

    return res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("GET APPOINTMENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve appointments",
    });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found for the provided ID",
      });
    }
    if (
  req.user.roles?.includes(
    "PATIENT"
  )
) {

  if (
    appointment.patientId.toString()
    !==
    req.user.patientId.toString()
  ) {

    return res.status(403).json({

      success: false,

      message:
        "Unauthorized",
    });
  }
}

    await Appointment.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.error("DELETE APPOINTMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete appointment",
    });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointment = await Appointment.findById(id)
      .populate("patientId")
      .populate("doctorEmployeeId");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found for the provided ID",
      });
    }

    return res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("GET APPOINTMENT BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve appointment details",
    });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
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

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointmentDate) {
      const [year, month, day] = appointmentDate.split("-").map(Number);

      const selectedDate = new Date(year, month - 1, day);
      selectedDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        return res.status(422).json({
          success: false,
          message: "Appointment date cannot be in the past",
        });
      }
    }

    const updatedDoctorId =
      doctorEmployeeId || appointment.doctorEmployeeId;

    const updatedAppointmentDate =
      appointmentDate || appointment.appointmentDate;

    const updatedTimeSlot = timeSlot || appointment.timeSlot;

    const conflictingAppointment = await Appointment.findOne({
      _id: { $ne: id },
      doctorEmployeeId: updatedDoctorId,
      appointmentDate: updatedAppointmentDate,
      timeSlot: updatedTimeSlot,
    });

    if (conflictingAppointment) {
      return res.status(409).json({
        success: false,
        message: "Selected time slot is already booked",
      });
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
  } catch (error) {
    console.error("UPDATE APPOINTMENT ERROR:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update appointment. Please try again later",
    });
  }
};

const getDoctorQueue = async (req, res) => {
  try {
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
  } catch (error) {
    console.error("GET DOCTOR QUEUE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve doctor's queue",
    });
  }
};
// Patient book 
const bookPatientAppointment =
async (req, res) => {

  try {

    const appointment =
      await bookPatientAppointmentService(
        req.body,
        req.user
      );

    return res.status(201).json({
      success: true,

      message:
        "Appointment request submitted successfully",

      data: appointment,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,

      message:
        error.message,
    });
  }
};

//Patient can see only there appointments 
const getMyAppointments =
async (req, res) => {

  try {

    const appointments =
      await getMyAppointmentsService(
        req.user.patientId
      );

    return res.status(200).json({
      success: true,

      data: appointments,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch appointments",
    });
  }
};

// Pending Appointments
const getPendingAppointments =
async (req, res) => {

  try {

    const appointments =
      await getPendingAppointmentsService();

    return res.status(200).json({
      success: true,

      data: appointments,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch pending appointments",
    });
  }
};

// Appointment approval
const approveAppointment =
async (req, res) => {

  try {

    const appointment =
      await approveAppointmentService(
        req.params.id
      );

    return res.status(200).json({
      success: true,

      message:
        "Appointment approved successfully",

      data: appointment,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,

      message:
        error.message,
    });
  }
};

// Reject appointment
const rejectAppointment =
async (req, res) => {

  try {

    const appointment =
      await rejectAppointmentService(
        req.params.id
      );

    return res.status(200).json({
      success: true,

      message:
        "Appointment rejected successfully",

      data: appointment,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,

      message:
        error.message,
    });
  }
};

// Update Appointment
const updateMyAppointment =
async (
  req,
  res
) => {

  try {

    const appointment =
      await updateMyAppointmentService(

        req.params.id,

        req.user.patientId,

        req.body
      );

    return res.status(200).json({

      success: true,

      message:
        "Appointment updated successfully",

      data:
        appointment,
    });

  } catch (error) {

    return res.status(400).json({

      success: false,

      message:
        error.message,
    });
  }
};
// Cancel Appointment 
const cancelMyAppointment =
async (
  req,
  res
) => {

  try {

    const appointment =
      await cancelMyAppointmentService(

        req.params.id,

        req.user.patientId
      );

    return res.status(200).json({

      success: true,

      message:
        "Appointment cancelled successfully",

      data:
        appointment,
    });

  } catch (error) {

    return res.status(400).json({

      success: false,

      message:
        error.message,
    });
  }
};

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