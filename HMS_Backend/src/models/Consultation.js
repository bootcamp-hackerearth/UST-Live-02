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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Consultation = mongoose.model(
  "Consultation",
  consultationSchema
);

module.exports = Consultation;