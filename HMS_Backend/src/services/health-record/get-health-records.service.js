const Consultation = require("../../models/Consultation");

const ROLES = require("../../constants/roles");
const mongoose = require("mongoose");
const {
  getPagination,
  buildPaginationMeta,
} = require("../../utils/pagination");

const getHealthRecordsService = async (user, query) => {
  const { page, limit, search } = query;

  const pagination = getPagination(page, limit);

  const matchStage = {
    isDeleted: false,
  };

  /*
    |--------------------------------------------------------------------------
    | Doctor Visibility
    |--------------------------------------------------------------------------
    */

  if (user.roles?.includes(ROLES.DOCTOR)) {
    matchStage.doctorEmployeeId = new mongoose.Types.ObjectId(user.employeeId);
  }

  const pipeline = [
    {
      $match: matchStage,
    },

    {
      $group: {
        _id: "$patientId",

        totalVisits: {
          $sum: 1,
        },

        lastVisit: {
          $max: "$createdAt",
        },
      },
    },

    {
      $lookup: {
        from: "patients",

        localField: "_id",

        foreignField: "_id",

        as: "patient",
      },
    },

    {
      $unwind: "$patient",
    },

    {
      $match: {
        "patient.isDeleted": false,
      },
    },
  ];

  /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

  if (search?.trim()) {
    pipeline.push({
      $match: {
        $or: [
          {
            "patient.firstName": {
              $regex: search,
              $options: "i",
            },
          },
          {
            "patient.lastName": {
              $regex: search,
              $options: "i",
            },
          },
          {
            "patient.patientId": {
              $regex: search,
              $options: "i",
            },
          },
        ],
      },
    });
  }

  /*
    |--------------------------------------------------------------------------
    | Total Count
    |--------------------------------------------------------------------------
    */

  const countPipeline = [
    ...pipeline,
    {
      $count: "total",
    },
  ];

  const countResult = await Consultation.aggregate(countPipeline);

  const total = countResult[0]?.total || 0;

  /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */

  pipeline.push(
    {
      $sort: {
        lastVisit: -1,
      },
    },
    {
      $skip: pagination.skip,
    },
    {
      $limit: pagination.limit,
    },
    {
      $project: {
        patient: {
          _id: "$patient._id",

          patientId: "$patient.patientId",

          firstName: "$patient.firstName",

          lastName: "$patient.lastName",

          phone: "$patient.phone",

          gender: "$patient.gender",

          bloodGroup: "$patient.bloodGroup",
        },

        totalVisits: 1,

        lastVisit: 1,
      },
    },
  );

  const healthRecords = await Consultation.aggregate(pipeline);

  return {
    data: healthRecords,

    meta: buildPaginationMeta(pagination.page, pagination.limit, total),
  };
};

module.exports = getHealthRecordsService;
