const fs = require("node:fs");
const path = require("node:path");

const Patient = require("../../models/Patient");
const ApiError = require("../../utils/ApiError");

const updateLabReportService = async (
  patientId,
  reportId,
  data,
  file,
  updatedBy,
) => {
  const patient = await Patient.findOne({
    _id: patientId,
    isDeleted: false,
  });

  if (!patient) {
    throw new ApiError(404, "Patient not found", "PATIENT_NOT_FOUND");
  }

  const report = patient.labReports.id(reportId);

  if (!report) {
    throw new ApiError(404, "Lab report not found", "LAB_REPORT_NOT_FOUND");
  }

  report.title = data.title ?? report.title;

  report.reportType = data.reportType ?? report.reportType;

  report.reportDate = data.reportDate ?? report.reportDate;

  report.labName = data.labName ?? report.labName;

  report.doctorName = data.doctorName ?? report.doctorName;

  report.notes = data.notes ?? report.notes;
  report.updatedBy = updatedBy;

  report.updatedAt = new Date();

  /*
  |--------------------------------------------------------------------------
  | Replace File
  |--------------------------------------------------------------------------
  */

  if (file) {
    if (report.documentUrl) {
      const oldFilePath = path.join(
        process.cwd(),
        report.documentUrl.replace(/^\//, ""),
      );

      try {
        if (fs.existsSync(oldFilePath)) {
          await fs.promises.unlink(oldFilePath);
        }
      } catch (error) {
        console.error("Unable to delete old file", error);
      }
    }

    report.documentUrl = `/uploads/lab-reports/${file.filename}`;
  }

  patient.updatedBy = updatedBy;

  await patient.save();

  return report.toObject();
};

module.exports = updateLabReportService;
