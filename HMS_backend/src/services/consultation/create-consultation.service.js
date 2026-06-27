const Consultation = require("../../models/Consultation");
const Appointment = require("../../models/Appointment");
const ERR = require("../../utils/errors");

const createConsultationService = async (data) => {
  const {
    appointmentId,
    diagnosis,
    symptoms,
    doctorNotes,
    vitals,
    prescriptions,
  } = data;

  const existingConsultation = await Consultation.findOne({
    appointmentId,
  });

  if (existingConsultation) {
throw ERR.consultationAlreadyExists();
}

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    isDeleted: { $ne: true },
  });

  if (!appointment) {
throw ERR.appointmentNotFound();
 }

  const consultation = await Consultation.create({
    appointmentId,
    patientId: appointment.patientId,
    doctorEmployeeId: appointment.doctorEmployeeId,
    diagnosis,
    symptoms,
    doctorNotes,
    vitals,
    prescriptions,
    status: "COMPLETED",
  });

  await Appointment.findOneAndUpdate(
    {
      _id: appointmentId,
      isDeleted: { $ne: true },
    },
    {
      status: "COMPLETED",
    }
  );

  return consultation;
};

module.exports = createConsultationService;

