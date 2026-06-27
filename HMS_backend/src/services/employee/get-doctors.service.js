const Employee = require("../../models/Employee");
const { buildSearchFilter } = require("../../utils/pagination");

const getDoctorsService = async ({ skip, limit, sort, search, status }) => {
  const filter = {
    designation: "DOCTOR",
    isDeleted: { $ne: true },
  };

  if (search) {
    Object.assign(
      filter,
      buildSearchFilter(
        ["employeeCode", "name", "phone", "email", "department", "specialization"],
        search
      )
    );
  }

  if (status) {
    filter.status = status;
  }

  const total = await Employee.countDocuments(filter);

  const doctors = await Employee.find(filter)
    .select("name department specialization joiningDate availability consultationFee")
    .sort(sort)
    .skip(skip)
    .limit(limit);

  return {
    doctors,
    total,
  };
};

module.exports = getDoctorsService;

