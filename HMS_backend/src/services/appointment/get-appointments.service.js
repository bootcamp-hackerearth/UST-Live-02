const Appointment = require("../../models/Appointment");

const Patient = require("../../models/Patient");

const Employee = require("../../models/Employee");

const {
  applyMappedFilters,
  executePagedQuery,
  preparePagedFilter,
} = require("../../utils/pagination");

const applyRoleVisibility = (filter, user) => {
  if (user.roles?.includes("DOCTOR")) {
    filter.doctorEmployeeId = user.employeeId;
  }

  if (user.roles?.includes("PATIENT")) {
    filter.patientId = user.patientId;
  }
};

const applyBasicFilters = (filter, query) => {
  const filterMap = {
    doctor: "doctorEmployeeId",
    visitMode: "visitMode",
    appointmentType: "appointmentType",
    priority: "priority",
  };

  if (query.status && query.status !== "ALL") {
    filter.status = query.status;
  }

  applyMappedFilters(filter, query, filterMap);
};

const applyAppointmentDateFilter = (filter, appointmentDate) => {
  if (!appointmentDate) {
    return;
  }

  const selectedDate = new Date(appointmentDate);
  selectedDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(selectedDate);
  nextDay.setDate(nextDay.getDate() + 1);

  filter.appointmentDate = {
    $gte: selectedDate,
    $lt: nextDay,
  };
};

const findMatchingIdsForSearch = async (search) => {
  const patients = await Patient.find({
    $or: [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { patientId: { $regex: search, $options: "i" } },
    ],
  })
    .select("_id")
    .lean();

  const doctors = await Employee.find({
    name: {
      $regex: search,
      $options: "i",
    },
  })
    .select("_id")
    .lean();

  return {
    patientIds: patients.map((patient) => patient._id),
    doctorIds: doctors.map((doctor) => doctor._id),
  };
};

const applySearchFilter = async (filter, search) => {
  if (!search?.trim()) {
    return;
  }

  const { patientIds, doctorIds } = await findMatchingIdsForSearch(search);

  filter.$or = [
    { appointmentId: { $regex: search, $options: "i" } },
    { patientId: { $in: patientIds } },
    { doctorEmployeeId: { $in: doctorIds } },
  ];
};

const getAppointmentSort = (isCursorPagination) =>
  isCursorPagination
    ? {
        createdAt: -1,
        _id: -1,
      }
    : {
        appointmentDate: -1,
        timeSlot: -1,
      };

const getAppointmentsService = async (user, query) => {
  const filter = {
    isDeleted: false,
  };

  applyRoleVisibility(filter, user);
  applyBasicFilters(filter, query);
  applyAppointmentDateFilter(filter, query.appointmentDate);
  await applySearchFilter(filter, query.search);

  const { pagination, isCursorPagination, totalFilter } = preparePagedFilter(
    filter,
    query,
  );

  return executePagedQuery({
    model: Appointment,
    filter,
    totalFilter,
    pagination,
    isCursorPagination,
    buildQuery: (appointments) => appointments.populate({
      path: "patientId",
      select: "patientId firstName lastName phone",
      match: {
        isDeleted: false,
      },
    })
    .populate({
      path: "doctorEmployeeId",
      select: "name department specialization",
      match: {
        isDeleted: false,
      },
    })
    .select(
      `
          appointmentId
          patientId
          doctorEmployeeId
          appointmentDate
          timeSlot
          status
          visitMode
          appointmentType
          priority
          tokenNumber
          createdAt
        `,
    )
    .sort(getAppointmentSort(isCursorPagination)),
  });
};

module.exports = getAppointmentsService;
