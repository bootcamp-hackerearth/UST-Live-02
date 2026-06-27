const PDFDocument = require("pdfkit");

const generatePrescriptionPdf = (consultation, res) => {
  // Create PDF document
  const doc = new PDFDocument({
    margin: 50,
  });

  // Set response headers
  res.setHeader(
    "Content-Type",
    "application/pdf"
  );

  res.setHeader(
    "Content-Disposition",
    "inline; filename=prescription.pdf"
  );

  doc.pipe(res);

  // Hospital header
  doc.fontSize(24).text("Visionary Health HMS", {
    align: "center",
  });

  doc.moveDown();

  doc.fontSize(18).text("Medical Prescription", {
    align: "center",
  });

  doc.moveDown(2);

  // Patient details
  doc.fontSize(16).text("Patient Details");

  doc.moveDown(0.5);

  doc.fontSize(12).text(
    `Patient Name: ${consultation?.patientId?.firstName} ${
      consultation?.patientId?.lastName
    }`
  );

  doc.text(`Patient ID: ${consultation?.patientId?.patientId}`);
  doc.text(`Gender: ${consultation?.patientId?.gender}`);

  doc.moveDown();

  // Doctor details
  doc.fontSize(16).text("Doctor Details");

  doc.moveDown(0.5);

  doc.text(`Doctor Name: ${consultation?.doctorEmployeeId?.name}`);
  doc.text(
    `Specialization: ${consultation?.doctorEmployeeId?.specialization}`
  );

  doc.moveDown();

  // Diagnosis
  doc.fontSize(16).text("Diagnosis");

  doc.moveDown(0.5);

  doc.fontSize(12).text(consultation?.diagnosis || "N/A");

  doc.moveDown();

  // Patient vitals
  doc.fontSize(16).text("Vitals");

  doc.moveDown(0.5);

  doc.text(
    `Blood Pressure: ${consultation?.vitals?.bloodPressure || "N/A"}`
  );

  doc.text(`Pulse Rate: ${consultation?.vitals?.pulseRate || "N/A"}`);
  doc.text(`Oxygen Level: ${consultation?.vitals?.oxygenLevel || "N/A"}`);
  doc.text(`Temperature: ${consultation?.vitals?.temperature || "N/A"}`);
  doc.text(`Weight: ${consultation?.vitals?.weight || "N/A"}`);

  doc.moveDown();

  // Prescribed medicines
  doc.fontSize(16).text("Prescriptions");

  doc.moveDown(0.5);

  consultation?.prescriptions?.forEach((medicine, index) => {
    doc.fontSize(12).text(`${index + 1}. ${medicine?.medicineName}`);

    doc.text(`Dosage: ${medicine?.dosage}`);
    doc.text(`Frequency: ${medicine?.frequency}`);
    doc.text(`Duration: ${medicine?.duration}`);

    doc.moveDown();
  });

  // Doctor notes
  doc.fontSize(16).text("Doctor Notes");

  doc.moveDown(0.5);

  doc.fontSize(12).text(consultation?.doctorNotes || "N/A");

  doc.moveDown(3);

  // Footer message
  doc.fontSize(12).text("Get Well Soon", {
    align: "center",
  });

  doc.end();
};

module.exports = generatePrescriptionPdf;