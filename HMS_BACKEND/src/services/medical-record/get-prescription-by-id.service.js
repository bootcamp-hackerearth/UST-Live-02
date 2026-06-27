const Consultation = require("../../models/Consultation");
const Appointment = require("../../models/Appointment");
const ERR = require("../../utils/errors");

const getPrescriptionByIdService = async (id, user) => {
  const filter = {
    _id: id,
  };

  if (user.roles?.includes("PATIENT")) {
    filter.patientId = user.patientId;
  }

  const prescription = await Consultation.findOne(filter)
    .populate("patientId")
    .populate("doctorEmployeeId")
    .populate("appointmentId");

  if (!prescription) {
    throw ERR.consultationNotFound();
  }

  if (user.roles?.includes("DOCTOR")) {
    const hasHandledPatient = await Appointment.exists({
      patientId: prescription.patientId._id || prescription.patientId,
      doctorEmployeeId: user.employeeId,
      isDeleted: { $ne: true },
    });

    if (!hasHandledPatient) {
      throw ERR.unauthorizedAccess();
    }
  }

  return prescription;
};

module.exports = getPrescriptionByIdService;
