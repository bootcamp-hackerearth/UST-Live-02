const Appointment = require("../../models/Appointment");
const getTodayAppointmentsService = async (user) => {
  let filter = {};

  if (user?.roles?.includes("DOCTOR")) {
    filter.doctorEmployeeId = user.employeeId;
  }

  const appointments = await Appointment.find(filter)
    .populate("patientId")
    .populate("doctorEmployeeId");

  const today = new Date();

  const todayString = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const todayAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.appointmentDate);

    const appointmentString = `${appointmentDate.getFullYear()}-${String(
      appointmentDate.getMonth() + 1,
    ).padStart(2, "0")}-${String(appointmentDate.getDate()).padStart(2, "0")}`;

    return appointmentString === todayString;
  });

  return todayAppointments.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
};
module.exports = getTodayAppointmentsService;
