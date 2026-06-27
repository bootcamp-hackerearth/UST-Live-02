const Appointment = require("../../models/Appointment");
const getAppointmentSearchFilter = require("./get-appointment-search-filter.service");
const { buildDateRangeFilter } = require("../../utils/pagination");

const getMyAppointments = async (
  patientId,
  { skip, limit, sort, search, status, fromDate, toDate }
) => {
  const filter = {
    patientId,
    isDeleted: { $ne: true },
  };

  if (search) {
    Object.assign(filter, await getAppointmentSearchFilter(search));
  }

  if (status) {
    filter.status = status;
  }

  Object.assign(
    filter,
    buildDateRangeFilter("appointmentDate", fromDate, toDate)
  );

  const total = await Appointment.countDocuments(filter);

  const appointments = await Appointment.find(filter)
    .populate({
      path: "doctorEmployeeId",
      select: "name department specialization",
    })
    .sort(sort)
    .skip(skip)
    .limit(limit);

  return {
    appointments,
    total,
  };
};

module.exports = getMyAppointments;

