const Consultation = require("../../models/consultation");

const getConsultationsService = async () => {
  return Consultation.find()
    .populate("patientId")
    .populate("doctorEmployeeId")
    .populate("appointmentId")
    .sort({
      createdAt: -1,
    });
};

module.exports = getConsultationsService;
