const Patient = require("../models/Patient");

const SEQUENCE_LENGTH = 5;
const MAX_GENERATION_ATTEMPTS = 50;

const getPatientIdPrefix = () => {
  const now = new Date();

  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `PAT-${year}${month}`;
};

const formatPatientId = (prefix, sequence) =>
  `${prefix}${String(sequence).padStart(SEQUENCE_LENGTH, "0")}`;

const getLatestSequence = async (prefix) => {
  const latestPatient = await Patient.findOne({
    patientId: {
      $regex: `^${prefix}`,
    },
  })
    .sort({
      patientId: -1,
    })
    .select("patientId")
    .lean();

  if (!latestPatient?.patientId) {
    return 0;
  }

  return Number.parseInt(latestPatient.patientId.slice(-SEQUENCE_LENGTH), 10);
};

const generatePatientId = async () => {
  const prefix = getPatientIdPrefix();
  const latestSequence = await getLatestSequence(prefix);

  for (let offset = 1; offset <= MAX_GENERATION_ATTEMPTS; offset += 1) {
    const patientId = formatPatientId(prefix, latestSequence + offset);
    const exists = await Patient.exists({
      $or: [
        {
          patientId,
        },
        {
          UHID: patientId,
        },
      ],
    });

    if (!exists) {
      return patientId;
    }
  }

  throw new Error("Unable to generate a unique patient ID");
};

module.exports = generatePatientId;
