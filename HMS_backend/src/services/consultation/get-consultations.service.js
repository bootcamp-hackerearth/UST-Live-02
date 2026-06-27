const Consultation = require("../../models/Consultation");
const getConsultationSearchFilter = require("./get-consultation-search-filter.service");
const {
  buildDateRangeFilter,
} = require("../../utils/pagination");

const getConsultationsService = async ({
  skip,
  limit,
  sort,
  search,
  status,
  fromDate,
  toDate,
}) => {
  const filter = {};

  if (search) {
    Object.assign(filter, await getConsultationSearchFilter(search));
  }

  if (status) {
    filter.status = status;
  }

  Object.assign(filter, buildDateRangeFilter("createdAt", fromDate, toDate));

  const total = await Consultation.countDocuments(filter);

  const consultations = await Consultation.find(filter)
    .populate("patientId")
    .populate("doctorEmployeeId")
    .populate("appointmentId")
    .sort(sort)
    .skip(skip)
    .limit(limit);

  return {
    consultations,
    total,
  };
};

module.exports = getConsultationsService;
