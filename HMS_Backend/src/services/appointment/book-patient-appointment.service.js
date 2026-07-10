const STATUS = require("../../constants/status");
const bookAppointment = require("./book-appointment.service");

const bookPatientAppointment = async (appointmentData, user) => {
  const patientId = user.patientId;

  await bookAppointment.prepareAppointmentBooking({
    patientId,
    doctorId: appointmentData.doctorId,
    appointmentDate: appointmentData.appointmentDate,
    appointmentTime: appointmentData.appointmentTime,
    includePatientDeletedFilter: true,
  });

  return bookAppointment.createAppointmentRecord({
    appointmentData,
    patientId,
    tokenNumber: null,
    createdBy: {
      createdByPatientId: user.patientId,
    },
    status: STATUS.PENDING,
  });
};

module.exports = bookPatientAppointment;
