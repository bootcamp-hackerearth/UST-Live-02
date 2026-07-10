const Consultation = require("../../models/Consultation");

const Patient = require("../../models/Patient");

const Employee = require("../../models/Employee");

const {
  applyMappedFilters,
  executePagedQuery,
  preparePagedFilter,
} = require("../../utils/pagination");

const applyDoctorVisibility = (filter, user) => {
  if (user.roles?.includes("DOCTOR")) {
    filter.doctorEmployeeId = user.employeeId;
  }
};

const applyBasicFilters = (filter, query) => {
  const filterMap = {
    doctor: "doctorEmployeeId",
    patient: "patientId",
    status: "status",
  };

  applyMappedFilters(filter, query, filterMap);
};

const applyDateRangeFilter = (filter, startDate, endDate) => {
  const createdAt = {};

  if (startDate) {
    createdAt.$gte = new Date(startDate);
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    createdAt.$lte = end;
  }

  if (Object.keys(createdAt).length) {
    filter.createdAt = createdAt;
  }
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
    { diagnosis: { $regex: search, $options: "i" } },
    { patientId: { $in: patientIds } },
    { doctorEmployeeId: { $in: doctorIds } },
  ];
};

const getConsultationsService = async (user, query) => {
  const filter = {
    isDeleted: false,
  };

  applyDoctorVisibility(filter, user);
  applyBasicFilters(filter, query);
  applyDateRangeFilter(filter, query.startDate, query.endDate);
  await applySearchFilter(filter, query.search);

  const { pagination, isCursorPagination, totalFilter } = preparePagedFilter(
    filter,
    query,
  );

  return executePagedQuery({
    model: Consultation,
    filter,
    totalFilter,
    pagination,
    isCursorPagination,
    buildQuery: (consultations) => consultations.populate({
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
    .populate({
      path: "appointmentId",
      select: "appointmentId appointmentDate timeSlot status",
      match: {
        isDeleted: false,
      },
    })
    .select(
      `
          appointmentId
          patientId
          doctorEmployeeId
          diagnosis
          symptoms
          doctorNotes
          prescriptions
          status
          createdAt
        `,
    )
    .sort({
      createdAt: -1,
      _id: -1,
    }),
  });
};

module.exports = getConsultationsService;
