const Consultation = require("../../models/Consultation");

const Patient = require("../../models/Patient");

const Employee = require("../../models/Employee");

const {
  getPagination,
  buildPaginationMeta,
} = require("../../utils/pagination");

const getConsultationsService = async (user, query) => {
  const { search, doctor, patient, status, startDate, endDate, page, limit } =
    query;

  const filter = {
    isDeleted: false,
  };

  /*
    |--------------------------------------------------------------------------
    | Doctor Visibility
    |--------------------------------------------------------------------------
    */

  if (user.roles?.includes("DOCTOR")) {
    filter.doctorEmployeeId = user.employeeId;
  }

  /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

  if (doctor) {
    filter.doctorEmployeeId = doctor;
  }

  if (patient) {
    filter.patientId = patient;
  }

  if (status) {
    filter.status = status;
  }
  /*
|--------------------------------------------------------------------------
| Date Range Filter
|--------------------------------------------------------------------------
*/

  if (startDate || endDate) {
    filter.createdAt = {};

    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filter.createdAt.$lte = end;
    }
  }

  /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

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

  /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */

  const pagination = getPagination(page, limit);

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
    })
    .skip(pagination.skip)
    .limit(pagination.limit)
    .lean();

  return {
    data: consultations,
    meta: buildPaginationMeta(pagination.page, pagination.limit, total),
  };
};

module.exports = getConsultationsService;
