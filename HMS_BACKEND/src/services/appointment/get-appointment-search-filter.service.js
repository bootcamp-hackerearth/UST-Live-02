const Patient = require("../../models/Patient");
const Employee = require("../../models/Employee");
const { buildSearchFilter } = require("../../utils/pagination");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getAppointmentSearchFilter = async (search) => {
  if (!search) {
    return {};
  }

  const regex = new RegExp(escapeRegex(search), "i");

  const [patients, doctors] = await Promise.all([
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
        { specialization: regex },
      ],
    }).select("_id"),
  ]);

  const appointmentSearchFilter = buildSearchFilter(
    [
      "appointmentId",
      "appointmentType",
      "priority",
      "paymentStatus",
      "visitMode",
      "status",
      "timeSlot",
      "symptoms",
    ],
    search
  );

  return {
    $or: [
      ...appointmentSearchFilter.$or,
      ...patients.map((patient) => ({ patientId: patient._id })),
      ...doctors.map((doctor) => ({ doctorEmployeeId: doctor._id })),
    ],
  };
};

module.exports = getAppointmentSearchFilter;

