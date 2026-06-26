const Patient = require("../models/Patient");

const generatePatientId = async () => {
  // Generate prefix using current year and month
  const now = new Date();

  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const prefix = `PAT-${year}${month}`;

  // Find latest patient registered this month
  const latestPatient = await Patient.findOne({
    patientId: {
      $regex: `^${prefix}`,
    },
  }).sort({
    createdAt: -1,
  });

  let sequence = 1;

  // Increment sequence if previous patient exists
  if (latestPatient) {
    const lastSequence = Number.parseInt(
      latestPatient.patientId.slice(-5)
    );

    sequence = lastSequence + 1;
  }

  const formattedSequence = String(sequence).padStart(5, "0");

  return `${prefix}${formattedSequence}`;
};

module.exports = generatePatientId;