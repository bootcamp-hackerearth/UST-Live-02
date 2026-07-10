const mongoose = require("mongoose");

const requiredRef = (ref) => ({
  type: mongoose.Schema.Types.ObjectId,
  ref,
  required: true,
});

const nullableUserRef = (defaultValue = null) => ({
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: defaultValue,
});

const softDeleteFields = () => ({
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedBy: nullableUserRef(),
  deletedAt: {
    type: Date,
    default: null,
  },
});

const auditFields = () => ({
  createdBy: nullableUserRef(),
  updatedBy: nullableUserRef(),
  ...softDeleteFields(),
});

// Medicine prescribed during consultation
const prescriptionSchema = new mongoose.Schema({
  medicineName: {
    type: String,
    required: true,
  },
  dosage: {
    type: String,
    required: true,
  },
  frequency: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
});

const consultationSchema = new mongoose.Schema(
  {
    // Linked appointment
    appointmentId: {
      ...requiredRef("Appointment"),
    },
    // Patient details
    patientId: {
      ...requiredRef("Patient"),
    },
    // Doctor handling the consultation
    doctorEmployeeId: {
      ...requiredRef("Employee"),
    },
    // Doctor's diagnosis
    diagnosis: {
      type: String,
      trim: true,
    },
    // Reported symptoms
    symptoms: [
      {
        type: String,
      },
    ],
    // Additional notes from the doctor
    doctorNotes: {
      type: String,
      trim: true,
    },
    // Patient vitals recorded during consultation
    vitals: {
      bloodPressure: {
        type: String,
      },
      pulseRate: {
        type: Number,
      },
      oxygenLevel: {
        type: Number,
      },
      temperature: {
        type: Number,
      },
      weight: {
        type: Number,
      },
    },
    // Prescribed medicines
    prescriptions: [prescriptionSchema],
    // Current consultation status
    status: {
      type: String,
      enum: ["IN_PROGRESS", "COMPLETED"],
      default: "IN_PROGRESS",
    },
    ...auditFields(),
    followUpDate: {
      type: Date,
      default: null,
    },
    diagnosisCategory: {
      type: String,
      trim: true,
    },
    labRecommendations: [
      {
        type: String,
        trim: true,
      },
    ],
    labReports: [
      {
        reportName: {
          type: String,
          trim: true,
        },
        uploadedBy: {
          ...nullableUserRef(undefined),
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        type: String,
        trim: true,
        uploadedBy: {
          ...nullableUserRef(undefined),
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
consultationSchema.index({
  patientId: 1,
  isDeleted: 1,
});

consultationSchema.index({
  appointmentId: 1,
  isDeleted: 1,
});
consultationSchema.index({
  doctorEmployeeId: 1,
  isDeleted: 1,
});

consultationSchema.index({
  status: 1,
  isDeleted: 1,
});

// Supports the default unfiltered, cursor-paginated list query
// (filter: { isDeleted: false }, sort: { createdAt: -1, _id: -1 })
consultationSchema.index({
  isDeleted: 1,
  createdAt: -1,
  _id: -1,
});

const Consultation = mongoose.model("Consultation", consultationSchema);

module.exports = Consultation;
