const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    // Basic patient information
    patientId: {
      type: String,
      required: true,
      unique: true,
    },

    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    dateOfBirth: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
    },

    bloodGroup: {
      type: String,
    },

    maritalStatus: {
      type: String,
      enum: ["SINGLE", "MARRIED", "DIVORCED"],
    },

    // Contact information
    countryCode: {
      type: String,
      required: true,
      default: "+91",
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: /^\d{10}$/,
    },

    email: {
      type: String,
    },

    address: {
      type: String,
    },

    city: {
      type: String,
    },

    state: {
      type: String,
    },

    pincode: {
      type: String,
    },

    country: {
      type: String,
    },

    // Emergency contact details
    emergencyContactName: {
      type: String,
    },

    emergencyContactPhone: {
      type: String,
    },

    relationship: {
      type: String,
    },

    // Medical information
    allergies: [
      {
        type: String,
      },
    ],

    chronicDiseases: [
      {
        type: String,
      },
    ],

    currentMedications: [
      {
        type: String,
      },
    ],

    pastSurgeries: [
      {
        type: String,
      },
    ],

    medicalHistory: {
      type: String,
    },

    familyMedicalHistory: {
      type: String,
    },

    // Insurance information
    insuranceProvider: {
      type: String,
    },

    insurancePolicyNumber: {
      type: String,
    },

    insuranceExpiryDate: {
      type: Date,
    },

    insuranceCoverageAmount: {
      type: Number,
    },

    // Hospital-related information
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    department: {
      type: String,
    },

    patientType: {
      type: String,
      enum: ["OPD", "IPD", "EMERGENCY"],
      default: "OPD",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "DISCHARGED", "INACTIVE"],
      default: "ACTIVE",
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
    labReports: {
      type: [
        {
          title: {
            type: String,
            required: true,
            trim: true,
          },

          labName: {
            type: String,
            trim: true,
          },

          doctorName: {
            type: String,
            trim: true,
          },

          reportType: {
            type: String,
            required: true,
          },

          reportDate: {
            type: Date,
            required: true,
          },

          documentUrl: {
            type: String,
            default: null,
          },

          notes: {
            type: String,
            trim: true,
          },

          uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
          },

          uploadedAt: {
            type: Date,
            default: Date.now,
          },
          updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
          },

          updatedAt: {
            type: Date,
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
        },
      ],
      default: [],
    },

    medicalDocuments: {
      type: [
        {
          title: {
            type: String,
            required: true,
            trim: true,
          },

          documentType: {
            type: String,
            required: true,
            trim: true,
          },

          hospitalName: {
            type: String,
            trim: true,
          },

          doctorName: {
            type: String,
            trim: true,
          },

          recordDate: {
            type: Date,
          },

          documentUrl: {
            type: String,
            default: null,
          },

          notes: {
            type: String,
            trim: true,
          },

          uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
          },

          uploadedAt: {
            type: Date,
            default: Date.now,
          },
          updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
          },

          updatedAt: {
            type: Date,
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
        },
      ],

      default: [],
    },
  },
  {
    timestamps: true,
  },
);

patientSchema.index({ email: 1 });
patientSchema.index({ status: 1 });

patientSchema.index({
  status: 1,
  isDeleted: 1,
});
patientSchema.index({
  patientType: 1,
  status: 1,
  isDeleted: 1,
});

patientSchema.index({
  assignedDoctor: 1,
  isDeleted: 1,
});

patientSchema.index({
  assignedDoctor: 1,
  status: 1,
  isDeleted: 1,
});

module.exports = mongoose.model("Patient", patientSchema);
