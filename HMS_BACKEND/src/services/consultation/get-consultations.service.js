const Consultation = require("../../models/Consultation");
const Patient = require("../../models/Patient");
const Employee = require("../../models/Employee");

const {
  applyCursorFilter,
  buildCursorPaginationMeta,
  getPagination,
  buildPaginationMeta,
} = require("../../utils/pagination");

const applyDateRangeFilter = (filter, startDate, endDate) => {
  if (!startDate && !endDate) return;
  filter.createdAt = {};
  if (startDate) {
    filter.createdAt.$gte = new Date(startDate);
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filter.createdAt.$lte = end;
  }
};

const getConsultationsService = async (user, query) => {
  const {
    search,
    doctor,
    patient,
    status,
    startDate,
    endDate,
    page,
    limit,
    cursor,
    pagination: paginationMode,
  } = query;

  const filter = {
    isDeleted: false,
  };

  //doctor visibilty
  if (user.roles?.includes("DOCTOR")) {
    filter.doctorEmployeeId = user.employeeId;
  }

  if (doctor) {
    filter.doctorEmployeeId = doctor;
  }

  if (patient) {
    filter.patientId = patient;
  }

  if (status) {
    filter.status = status;
  }

  applyDateRangeFilter(filter, startDate, endDate);

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
        diagnosis: {
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

  const pagination = getPagination(page, limit);
  const isCursorPagination = paginationMode === "cursor" || Boolean(cursor);

  if (isCursorPagination && cursor) {
    applyCursorFilter(filter, cursor);
  }

  const total = await Consultation.countDocuments(filter);

  const consultations = await Consultation.find(filter)
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
    })
    .skip(isCursorPagination ? 0 : pagination.skip)
    .limit(isCursorPagination ? pagination.limit + 1 : pagination.limit)
    .lean();

  const hasNextCursorPage =
    isCursorPagination && consultations.length > pagination.limit;
  const data = hasNextCursorPage
    ? consultations.slice(0, pagination.limit)
    : consultations;

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

module.exports = getConsultationsService;
