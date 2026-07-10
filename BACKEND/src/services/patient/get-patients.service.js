const Patient = require("../../models/Patient");
const Appointment = require("../../models/Appointment");

const {
  applyCursorFilter,
  buildPagedResult,
  getPagination,
} = require("../../utils/pagination");

const applySearchFilter = (filter, search) => {
  if (!search?.trim()) {
    return;
  }

  filter.$or = [
    { firstName: { $regex: search, $options: "i" } },
    { lastName: { $regex: search, $options: "i" } },
    { patientId: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
    { phone: { $regex: search, $options: "i" } },
  ];
};

const applyBasicFilters = (filter, query) => {
  const filterMap = {
    status: "status",
    patientType: "patientType",
    assignedDoctor: "assignedDoctor",
    department: "department",
    gender: "gender",
  };

  Object.entries(filterMap).forEach(([queryKey, filterKey]) => {
    if (query[queryKey]) {
      filter[filterKey] = query[queryKey];
    }
  });
};

const getDoctorPatientIds = async (employeeId) => {
  const appointments = await Appointment.find({
    doctorEmployeeId: employeeId,
    isDeleted: false,
  })
    .select("patientId")
    .lean();

  return [
    ...new Set(
      appointments.map((appointment) => appointment.patientId.toString()),
    ),
  ];
};

const applyDoctorVisibility = async (filter, user) => {
  if (!user.roles?.includes("DOCTOR")) {
    return;
  }

  filter._id = {
    $in: await getDoctorPatientIds(user.employeeId),
  };
};

const getPatientsService = async (user, query) => {
  const filter = {
    isDeleted: false,
  };

  applySearchFilter(filter, query.search);
  applyBasicFilters(filter, query);
  await applyDoctorVisibility(filter, user);

  /* Pagination */
  const pagination = getPagination(query.page, query.limit);
  const isCursorPagination =
    query.pagination === "cursor" || Boolean(query.cursor);
  const totalFilter = { ...filter };

  applyCursorFilter(filter, isCursorPagination ? query.cursor : null);

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

  return buildPagedResult({
    items: patients,
    pagination,
    isCursorPagination,
    total,
  });
};

module.exports = getPatientsService;
