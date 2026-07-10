const Appointment = require("../../models/Appointment");
const Patient = require("../../models/Patient");
const Employee = require("../../models/Employee");

const {
  applyCursorFilter,
  buildCursorPaginationMeta,
  getPagination,
  buildPaginationMeta,
} = require("../../utils/pagination");

const applyRoleFilter = (user, filter) => {
  if (user.roles?.includes("DOCTOR")) {
    filter.doctorEmployeeId = user.employeeId;
  }
  if (user.roles?.includes("PATIENT")) {
    filter.patientId = user.patientId;
  }
};

const applyAppointmentDateFilter = (filter, appointmentDate) => {
  if (!appointmentDate) return;
  const selectedDate = new Date(appointmentDate);
  selectedDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(selectedDate);
  nextDay.setDate(nextDay.getDate() + 1);
  filter.appointmentDate = { $gte: selectedDate, $lt: nextDay };
};

const getAppointmentsService = async (user, query) => {
  const {
    search,
    status,
    doctor,
    appointmentDate,
    visitMode,
    appointmentType,
    priority,
    page,
    limit,
    cursor,
    pagination: paginationMode,
  } = query;

  const filter = {
    isDeleted: false,
  };

  /* Role Based Visibility */
  applyRoleFilter(user, filter);

  /* Filters */
  if (status && status !== "ALL") {
    filter.status = status;
  }
  if (doctor) {
    filter.doctorEmployeeId = doctor;
  }

  if (visitMode) {
    filter.visitMode = visitMode;
  }

  if (appointmentType) {
    filter.appointmentType = appointmentType;
  }

  if (priority) {
    filter.priority = priority;
  }

  /* Appointment Date */
  applyAppointmentDateFilter(filter, appointmentDate);

  /* Search */
  if (search?.trim()) {
    const patients = await Patient.find({
      $or: [
        {
          firstName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          lastName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          patientId: {
            $regex: search,
            $options: "i",
          },
        },
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

    filter.$or = [
      {
        appointmentId: {
          $regex: search,
          $options: "i",
        },
      },
      {
        patientId: {
          $in: patients.map((patient) => patient._id),
        },
      },
      {
        doctorEmployeeId: {
          $in: doctors.map((doctor) => doctor._id),
        },
      },
    ];
  }

  /* Pagination */
  const pagination = getPagination(page, limit);
  const isCursorPagination = paginationMode === "cursor" || Boolean(cursor);
  const totalFilter = { ...filter };

  if (isCursorPagination && cursor) {
    applyCursorFilter(filter, cursor);
  }

  const total = await Appointment.countDocuments(totalFilter);

  const appointments = await Appointment.find(filter)
    .populate({
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
    .sort(
      isCursorPagination
        ? {
            createdAt: -1,
            _id: -1,
          }
        : {
            appointmentDate: -1,
            timeSlot: -1,
          },
    )
    .skip(isCursorPagination ? 0 : pagination.skip)
    .limit(isCursorPagination ? pagination.limit + 1 : pagination.limit)
    .lean();

  const hasNextCursorPage =
    isCursorPagination && appointments.length > pagination.limit;
  const data = hasNextCursorPage
    ? appointments.slice(0, pagination.limit)
    : appointments;

  return {
    data,
    meta: isCursorPagination
      ? buildCursorPaginationMeta(
          pagination.limit,
          data,
          hasNextCursorPage,
          total,
        )
      : buildPaginationMeta(pagination.page, pagination.limit, total),
  };
};

module.exports = getAppointmentsService;
