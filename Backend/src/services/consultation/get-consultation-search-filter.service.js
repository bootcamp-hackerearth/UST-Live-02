const Appointment = require("../../models/Appointment");
const Employee = require("../../models/Employee");
const Patient = require("../../models/Patient");
const { buildSearchFilter } = require("../../utils/pagination");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getConsultationSearchFilter = async (search) => {
  if (!search) {
    return {};
  }

  const regex = new RegExp(escapeRegex(search), "i");

  const [patients, doctors, appointments] = await Promise.all([
    Patient.find({
      isDeleted: { $ne: true },
      $or: [
        { patientId: regex },
        { firstName: regex },
        { lastName: regex },
        { phone: regex },
        { email: regex },
      ],
    }).select("_id"),
    Employee.find({
      isDeleted: { $ne: true },
      $or: [
        { employeeCode: regex },
        { name: regex },
        { phone: regex },
        { email: regex },
        { department: regex },
        { designation: regex },
        { specialization: regex },
      ],
    }).select("_id"),
    Appointment.find({
      isDeleted: { $ne: true },
      $or: [
        { appointmentId: regex },
        { status: regex },
        { timeSlot: regex },
        { appointmentType: regex },
        { priority: regex },
        { paymentStatus: regex },
        { visitMode: regex },
        { symptoms: regex },
      ],
    }).select("_id"),
  ]);

  const consultationSearchFilter = buildSearchFilter(
    [
      "diagnosis",
      "symptoms",
      "doctorNotes",
      "status",
      "prescriptions.medicineName",
      "prescriptions.dosage",
      "prescriptions.frequency",
      "prescriptions.duration",
    ],
    search
  );

  return {
    $or: [
      ...consultationSearchFilter.$or,
      ...patients.map((patient) => ({ patientId: patient._id })),
      ...doctors.map((doctor) => ({ doctorEmployeeId: doctor._id })),
      ...appointments.map((appointment) => ({ appointmentId: appointment._id })),
    ],
  };
};

module.exports = getConsultationSearchFilter;

