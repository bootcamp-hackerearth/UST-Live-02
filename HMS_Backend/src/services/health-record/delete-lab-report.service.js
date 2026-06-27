const fs = require("fs");
const path = require("path");

const Patient = require("../../models/Patient");
const ApiError = require("../../utils/ApiError");

const deleteLabReportService = async (patientId, reportId, deletedBy) => {
  const patient = await Patient.findOne({
    _id: patientId,
    isDeleted: false,
  });

  if (!patient) {
    throw new ApiError(404, "Patient not found", "PATIENT_NOT_FOUND");
  }

  const index = patient.labReports.findIndex(
    (report) => report._id.toString() === reportId,
  );

  if (index === -1) {
    throw new ApiError(404, "Lab report not found", "LAB_REPORT_NOT_FOUND");
  }

  const report = patient.labReports[index];

  /*
  |--------------------------------------------------------------------------
  | Delete Physical File
  |--------------------------------------------------------------------------
  */

  if (report.documentUrl) {
    const filePath = path.join(
      process.cwd(),
      report.documentUrl.replace(/^\//, ""),
    );

    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error("Unable to delete lab report file", error);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Remove Report
  |--------------------------------------------------------------------------
  */
  report.isDeleted = true;
  report.deletedBy = deletedBy;
  report.deletedAt = new Date();

  patient.markModified("labReports");

  await patient.save();
  patient.markModified("labReports");

  await patient.save();

  return {
    message: "Lab report deleted successfully",
  };
};

module.exports = deleteLabReportService;
