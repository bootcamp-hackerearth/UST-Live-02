const Consultation = require("../../models/Consultation");

const ROLES = require("../../constants/roles");
const mongoose = require("mongoose");
const {
  buildCursorPaginationMeta,
  decodeCursor,
  getPagination,
  buildPaginationMeta,
} = require("../../utils/pagination");

const getHealthRecordsService = async (user, query) => {
  const { page, limit, search, cursor, pagination: paginationMode } = query;

  const pagination = getPagination(page, limit);
  const isCursorPagination = paginationMode === "cursor" || Boolean(cursor);

  const matchStage = {
    isDeleted: false,
  };

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

  const countPipeline = [
    ...pipeline,
    {
      $count: "total",
    },
  ];

  const countResult = await Consultation.aggregate(countPipeline);

  const total = countResult[0]?.total || 0;

  if (isCursorPagination && cursor) {
    const decodedCursor = decodeCursor(cursor);

    if (decodedCursor) {
      pipeline.push({
        $match: {
          $or: [
            {
              lastVisit: {
                $lt: new Date(decodedCursor.createdAt),
              },
            },
            {
              lastVisit: new Date(decodedCursor.createdAt),
              _id: {
                $lt: new mongoose.Types.ObjectId(decodedCursor.id),
              },
            },
          ],
        },
      });
    }
  }

  pipeline.push(
    {
      $sort: {
        lastVisit: -1,
        _id: -1,
      },
    },
    {
      $skip: isCursorPagination ? 0 : pagination.skip,
    },
    {
      $limit: isCursorPagination ? pagination.limit + 1 : pagination.limit,
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
        _id: 1,
        createdAt: "$lastVisit",
        totalVisits: 1,
        lastVisit: 1,
      },
    },
  );

  const healthRecords = await Consultation.aggregate(pipeline);
  const hasNextCursorPage =
    isCursorPagination && healthRecords.length > pagination.limit;
  const data = hasNextCursorPage
    ? healthRecords.slice(0, pagination.limit)
    : healthRecords;

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

module.exports = getHealthRecordsService;
