const Appointment = require("../models/Appointment");
const mongoose = require("mongoose");
const getAvailableSlotsService = require("../services/appointment/get-available-slots.service");
const bookAppointmentService = require("../services/appointment/book-appointment.service");

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

    if (req.user.roles?.includes("DOCTOR")) {
      filter.doctorEmployeeId = req.user.employeeId;
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

module.exports = {
  getAvailableSlots,
  bookAppointment,
  getAppointments,
  deleteAppointment,
  getAppointmentById,
  updateAppointment,
  getDoctorQueue,
};