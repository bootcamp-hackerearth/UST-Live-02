const Appointment = require("../../models/Appointment");
const Employee = require("../../models/Employee");
const mongoose = require("mongoose");

const generateSlots = require("../../utils/generateSlots");

const getAvailableSlots = async (doctorId, appointmentDate) => {
  // Validate required fields
  if (!doctorId || !appointmentDate) {
    throw new Error("Doctor ID and appointment date are required");
  }

  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    throw new Error("Invalid doctor ID");
  }

  // Prevent slot lookup for past dates
  const selectedDate = new Date(appointmentDate);

  if (Number.isNaN(selectedDate.getTime())) {
    throw new Error("Invalid appointment date");
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    throw new Error("Cannot select past dates");
  }

  // Find doctor record
  const doctor = await Employee.findById(doctorId);

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  // Check doctor availability status
  if (!doctor?.availability?.isAvailable) {
    throw new Error("Doctor is currently unavailable");
  }

  if (!doctor?.availability?.startTime || !doctor?.availability?.endTime) {
    throw new Error("Doctor availability hours are not configured");
  }

  // Verify doctor works on selected day
  const appointmentDay = new Date(appointmentDate)
    .toLocaleDateString("en-US", {
      weekday: "long",
    })
    .toUpperCase();

  const workingDays = doctor?.availability?.workingDays || [];
  const normalizedWorkingDays = workingDays.map((day) => day.toUpperCase());

  if (!normalizedWorkingDays.includes(appointmentDay)) {
    throw new Error(`Doctor is not available on ${appointmentDay}`);
  }

  // Generate all possible slots
  const allSlots = generateSlots(
    doctor?.availability?.startTime,
    doctor?.availability?.endTime,
    doctor?.availability?.slotDuration,
    doctor?.availability?.breakStartTime,
    doctor?.availability?.breakEndTime
  );

  // Normalize date for appointment search
  const normalizedDate = new Date(appointmentDate);

  normalizedDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(normalizedDate);
  nextDay.setDate(nextDay.getDate() + 1);

  // Fetch existing appointments
  const bookedAppointments = await Appointment.find({
    doctorEmployeeId: doctorId,
    appointmentDate: {
      $gte: normalizedDate,
      $lt: nextDay,
    },
    status: {
      $nin: ["CANCELLED", "NO_SHOW"],
    },
  });

  // Create set of booked time slots
  const bookedSlots = new Set(
    bookedAppointments.map((appointment) => appointment.timeSlot)
  );

  const now = new Date();
  const isToday =
    normalizedDate.getFullYear() === now.getFullYear() &&
    normalizedDate.getMonth() === now.getMonth() &&
    normalizedDate.getDate() === now.getDate();

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const toMinutes = (slot) => {
    const [hours, minutes] = slot.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Return only available future slots.
  return allSlots.filter((slot) => {
    const isBooked = bookedSlots.has(slot);
    const isPastTodaySlot = isToday && toMinutes(slot) <= currentMinutes;

    return !isBooked && !isPastTodaySlot;
  });
};

module.exports = getAvailableSlots;
