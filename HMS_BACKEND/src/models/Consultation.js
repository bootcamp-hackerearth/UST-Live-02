const mongoose = require("mongoose");

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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    // Patient details
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    // Doctor handling the consultation
    doctorEmployeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
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
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
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
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
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

const Consultation = mongoose.model("Consultation", consultationSchema);

module.exports = Consultation;
