const Appointment = require("../../models/Appointment");
const getAppointmentSearchFilter = require("./get-appointment-search-filter.service");
const { buildDateRangeFilter } = require("../../utils/pagination");

const getPendingAppointments = async ({
  skip,
  limit,
  sort,
  search,
  fromDate,
  toDate,
}) => {
  const filter = {
    status: "PENDING",
    isDeleted: { $ne: true },
  };

  if (search) {
    Object.assign(filter, await getAppointmentSearchFilter(search));
  }

  Object.assign(
    filter,
    buildDateRangeFilter("appointmentDate", fromDate, toDate)
  );

  const total = await Appointment.countDocuments(filter);

  const appointments = await Appointment.find(filter)
    .populate("patientId")
    .populate("doctorEmployeeId")
    .sort(sort)
    .skip(skip)
    .limit(limit);

  return {
    appointments,
    total,
  };
};

module.exports = getPendingAppointments;

