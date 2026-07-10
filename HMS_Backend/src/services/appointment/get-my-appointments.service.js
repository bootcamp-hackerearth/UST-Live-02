const Appointment = require("../../models/Appointment");
const Employee = require("../../models/Employee");

const {
  getPagination,
  buildPaginationMeta,
} = require("../../utils/pagination");

const isCursorPaginationRequest = (query) =>
  query.pagination === "cursor" || Boolean(query.cursor);

const encodeAppointmentCursor = (appointment) => {
  if (!appointment?.appointmentDate || !appointment?.timeSlot || !appointment?._id) {
    return null;
  }

  return Buffer.from(
    JSON.stringify({
      appointmentDate: appointment.appointmentDate,
      timeSlot: appointment.timeSlot,
      id: appointment._id,
    }),
  ).toString("base64url");
};

const decodeAppointmentCursor = (cursor) => {
  if (!cursor) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    );

    if (!parsed.appointmentDate || !parsed.timeSlot || !parsed.id) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const applyAppointmentCursorFilter = (filter, cursor) => {
  const decodedCursor = decodeAppointmentCursor(cursor);

  if (!decodedCursor) {
    return;
  }

  const existingSearch = filter.$or;
  delete filter.$or;

  filter.$and = [
    ...(existingSearch ? [{ $or: existingSearch }] : []),
    {
      $or: [
        {
          appointmentDate: {
            $lt: new Date(decodedCursor.appointmentDate),
          },
        },
        {
          appointmentDate: new Date(decodedCursor.appointmentDate),
          timeSlot: {
            $lt: decodedCursor.timeSlot,
          },
        },
        {
          appointmentDate: new Date(decodedCursor.appointmentDate),
          timeSlot: decodedCursor.timeSlot,
          _id: {
            $lt: decodedCursor.id,
          },
        },
      ],
    },
  ];
};

const buildCursorMeta = (appointments, hasNextPage, limit, total) => ({
  limit,
  total,
  totalRecords: total,
  nextCursor: hasNextPage
    ? encodeAppointmentCursor(appointments[appointments.length - 1])
    : null,
  hasNextPage,
});

const getMyAppointments = async (patientId, query = {}) => {
  const { search, status, page, limit } = query;

  const filter = {
    patientId,
    isDeleted: false,
  };

  if (status && status !== "ALL") {
    filter.status = status;
  }

  if (search?.trim()) {
    const searchText = search.trim();

    const doctors = await Employee.find({
      isDeleted: false,
      $or: [
        {
          name: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          department: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          specialization: {
            $regex: searchText,
            $options: "i",
          },
        },
      ],
    })
      .select("_id")
      .lean();

    filter.$or = [
      {
        appointmentId: {
          $regex: searchText,
          $options: "i",
        },
      },
      {
        status: {
          $regex: searchText,
          $options: "i",
        },
      },
      {
        appointmentType: {
          $regex: searchText,
          $options: "i",
        },
      },
      {
        doctorEmployeeId: {
          $in: doctors.map((doctor) => doctor._id),
        },
      },
    ];
  }

  const pagination = getPagination(page, limit);
  const isCursorPagination = isCursorPaginationRequest(query);
  const totalFilter = { ...filter };

  applyAppointmentCursorFilter(filter, isCursorPagination ? query.cursor : null);

  const total = await Appointment.countDocuments(totalFilter);

  const appointments = await Appointment.find(filter)
    .populate({
      path: "doctorEmployeeId",
      select: "name department specialization",
      match: {
        isDeleted: false,
      },
    })
    .sort({
      appointmentDate: -1,
      timeSlot: -1,
      _id: -1,
    })
    .skip(isCursorPagination ? 0 : pagination.skip)
    .limit(isCursorPagination ? pagination.limit + 1 : pagination.limit)
    .lean();
  const hasNextCursorPage =
    isCursorPagination && appointments.length > pagination.limit;
  const visibleAppointments = hasNextCursorPage
    ? appointments.slice(0, pagination.limit)
    : appointments;

  const meta = buildPaginationMeta(pagination.page, pagination.limit, total);

  return {
    data: visibleAppointments,
    meta: isCursorPagination
      ? buildCursorMeta(
          visibleAppointments,
          hasNextCursorPage,
          pagination.limit,
          total,
        )
      : {
          ...meta,
          totalRecords: meta.total,
        },
  };
};

module.exports = getMyAppointments;
