const Appointment = require("../../models/Appointment");
const Patient = require("../../models/Patient");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getRecordPatients = async ({ user, skip, limit, sort, search }) => {
  const filter = {
    isDeleted: { $ne: true },
  };

  if (user.roles?.includes("DOCTOR")) {
    const patientIds = await Appointment.distinct("patientId", {
      doctorEmployeeId: user.employeeId,
      isDeleted: { $ne: true },
    });

    filter._id = {
      $in: patientIds,
    };
  }

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");

    filter.$or = [
      { firstName: regex },
      { lastName: regex },
      { patientId: regex },
      { gender: regex },
      { status: regex },
      { phone: regex },
      { email: regex },
    ];
  }

  const total = await Patient.countDocuments(filter);

  const patients = await Patient.find(filter)
    .select("firstName lastName patientId gender status createdAt")
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    patients,
    total,
  };
};

module.exports = getRecordPatients;
