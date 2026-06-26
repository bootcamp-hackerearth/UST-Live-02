const Consultation = require("../../models/Consultation");
const Appointment = require("../../models/Appointment");
const ERR = require("../../utils/errors");

const getPrescriptionsService = async ({
  user,
  patientId,
  skip,
  limit,
  sort,
}) => {
  const filter = {
    status: "COMPLETED",
  };

  if (patientId) {
    filter.patientId = patientId;
  }

  if (user.roles?.includes("DOCTOR")) {
    if (!patientId) {
      throw ERR.unauthorizedAccess();
    }
// check dr handled the patient before
    const hasHandledPatient = await Appointment.exists({
      patientId,
      doctorEmployeeId: user.employeeId,
      isDeleted: { $ne: true },
    });

    if (!hasHandledPatient) {
      throw ERR.unauthorizedAccess();
    }
  }

  if (user.roles?.includes("PATIENT")) {
    filter.patientId = user.patientId;
  }

  const total = await Consultation.countDocuments(filter);

  const records = await Consultation.find(filter)
    .populate("patientId")
    .populate("doctorEmployeeId")
    .populate("appointmentId")
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    records,
    total,
  };
};

module.exports = getPrescriptionsService;
