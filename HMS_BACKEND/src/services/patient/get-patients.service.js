const Patient = require("../../models/Patient");
const Appointment = require("../../models/Appointment");

const {
  applyCursorFilter,
  buildCursorPaginationMeta,
  getPagination,
  buildPaginationMeta,
} = require("../../utils/pagination");

const getPatientsService = async (user, query) => {
  const {
    search,
    status,
    patientType,
    assignedDoctor,
    department,
    gender,
    page,
    limit,
    cursor,
    pagination: paginationMode,
  } = query;

  const filter = {
    isDeleted: false,
  };

  /* Search */
  if (search?.trim()) {
    filter.$or = [
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
      {
        email: {
          $regex: search,
          $options: "i",
        },
      },
      {
        phone: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  /* Filters */
  if (status) {
    filter.status = status;
  }

  if (patientType) {
    filter.patientType = patientType;
  }

  if (assignedDoctor) {
    filter.assignedDoctor = assignedDoctor;
  }

  if (department) {
    filter.department = department;
  }

  if (gender) {
    filter.gender = gender;
  }

  /* Doctor Visibility */
  if (user.roles?.includes("DOCTOR")) {
    const appointments = await Appointment.find({
      doctorEmployeeId: user.employeeId,
      isDeleted: false,
    })
      .select("patientId")
      .lean();

    const patientIds = [
      ...new Set(
        appointments.map((appointment) => appointment.patientId.toString()),
      ),
    ];

    filter._id = {
      $in: patientIds,
    };
  }

  /* Pagination */
  const pagination = getPagination(page, limit);
  const isCursorPagination = paginationMode === "cursor" || Boolean(cursor);
  const totalFilter = { ...filter };

  if (isCursorPagination && cursor) {
    applyCursorFilter(filter, cursor);
  }

  const total = await Patient.countDocuments(totalFilter);

  const patients = await Patient.find(filter)
    .populate({
      path: "assignedDoctor",
      select: "name department specialization",
      match: {
        isDeleted: false,
      },
    })
    .select(
      `
        patientId
        firstName
        lastName
        phone
        email
        gender
        patientType
        status
        department
        assignedDoctor
        createdAt
      `,
    )
    .sort({
      createdAt: -1,
      _id: -1,
    })
    .skip(isCursorPagination ? 0 : pagination.skip)
    .limit(isCursorPagination ? pagination.limit + 1 : pagination.limit)
    .lean();

  const hasNextCursorPage =
    isCursorPagination && patients.length > pagination.limit;
  const data = hasNextCursorPage
    ? patients.slice(0, pagination.limit)
    : patients;

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

module.exports = getPatientsService;
