const Appointment = require("../../models/Appointment");
const Employee = require("../../models/Employee");

const {
  getPagination,
  buildPaginationMeta,
} = require("../../utils/pagination");

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
  const total = await Appointment.countDocuments(filter);

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
    })
    .skip(pagination.skip)
    .limit(pagination.limit)
    .lean();

  const meta = buildPaginationMeta(pagination.page, pagination.limit, total);

  return {
    data: appointments,
    meta: {
      ...meta,
      totalRecords: meta.total,
    },
  };
};

module.exports = getMyAppointments;
