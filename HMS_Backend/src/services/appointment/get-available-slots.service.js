const Appointment = require("../../models/Appointment");

const generateSlots = require("../../utils/generateSlots");
const STATUS = require("../../constants/status");
const ApiError = require("../../utils/ApiError");
const bookAppointment = require("./book-appointment.service");

const getAvailableSlots = async (doctorId, appointmentDate) => {
  // Validate required fields
  if (!doctorId || !appointmentDate) {
    throw new ApiError(
      400,
      "Doctor ID and appointment date are required",
      "APPOINTMENT_DATE_REQUIRED",
    );
  }

  bookAppointment.assertFutureAppointmentDate(
    appointmentDate,
    "Cannot select past dates",
  );

  const doctor = await bookAppointment.findActiveDoctor(doctorId);
  bookAppointment.assertDoctorCanWork(doctor, appointmentDate);

  // Generate all possible slots
  const allSlots = generateSlots(
    doctor?.availability?.startTime,
    doctor?.availability?.endTime,
    doctor?.availability?.slotDuration,
    doctor?.availability?.breakStartTime,
    doctor?.availability?.breakEndTime,
  );

  const { normalizedDate, nextDay } = bookAppointment.getAppointmentDateRange(
    appointmentDate,
    false,
  );

  // Fetch existing appointments
  const bookedAppointments = await Appointment.find({
    doctorEmployeeId: doctorId,
    appointmentDate: {
      $gte: normalizedDate,
      $lt: nextDay,
    },
    status: {
      $nin: [STATUS.CANCELLED, STATUS.REJECTED, STATUS.NO_SHOW],
    },
    isDeleted: false,
  });
  // Create set of booked time slots
  const bookedSlots = new Set(
    bookedAppointments.map((appointment) => appointment.timeSlot),
  );
  // Remove past slots if selected date is today
  const availableSlots = bookAppointment.filterFutureSlotsForDate(
    allSlots.filter((slot) => !bookedSlots.has(slot)),
    appointmentDate,
  );

  return availableSlots;
};

module.exports = getAvailableSlots;
