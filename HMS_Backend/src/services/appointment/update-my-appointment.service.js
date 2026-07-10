const Appointment = require("../../models/Appointment");
const STATUS = require("../../constants/status");
const ApiError = require("../../utils/ApiError");
const bookAppointment = require("./book-appointment.service");

const updateMyAppointment = async (appointmentId, patientId, updateData) => {
  const { appointmentDate, appointmentTime, symptoms } = updateData;

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    isDeleted: false,
  });

  if (!appointment) {
    throw new ApiError(404, "Appointment not found", "APPOINTMENT_NOT_FOUND");
  }

  if (appointment.patientId.toString() !== patientId) {
    throw new ApiError(403, "Unauthorized access", "FORBIDDEN");
  }

  if (appointment.status !== STATUS.PENDING) {
    throw new ApiError(
      400,
      "Only pending appointments can be modified",
      "INVALID_APPOINTMENT_STATUS",
    );
  }

  bookAppointment.assertFutureAppointmentDate(
    appointmentDate,
    "Past date not allowed",
  );
  bookAppointment.assertFutureAppointmentTime(appointmentDate, appointmentTime);

  const doctor = await bookAppointment.findActiveDoctor(
    appointment.doctorEmployeeId,
  );

  bookAppointment.assertDoctorCanWork(doctor, appointmentDate);
  bookAppointment.assertSlotOutsideBreak(doctor, appointmentTime);
  bookAppointment.assertValidGeneratedSlot(doctor, appointmentTime);

  const [year, month, day] = appointmentDate.split("-").map(Number);

  const normalizedDate = new Date(year, month - 1, day, 12, 0, 0);

  const nextDay = new Date(normalizedDate);

  nextDay.setDate(nextDay.getDate() + 1);

  const existingAppointment = await Appointment.findOne({
    _id: {
      $ne: appointmentId,
    },
    doctorEmployeeId: appointment.doctorEmployeeId,
    timeSlot: appointmentTime,
    appointmentDate: {
      $gte: normalizedDate,
      $lt: nextDay,
    },
    status: {
      $nin: [STATUS.CANCELLED, STATUS.REJECTED, STATUS.NO_SHOW],
    },
    isDeleted: false,
  });

  if (existingAppointment) {
    throw new ApiError(
      409,
      "Selected slot already booked",
      "SLOT_ALREADY_BOOKED",
    );
  }

  appointment.appointmentDate = appointmentDate;

  appointment.timeSlot = appointmentTime;

  appointment.symptoms = symptoms || [];

  await appointment.save();

  return appointment;
};

module.exports = updateMyAppointment;
