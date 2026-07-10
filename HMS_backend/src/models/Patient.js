const mongoose = require("mongoose");

const userRef = () => ({
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
});

const employeeRef = () => ({
  type: mongoose.Schema.Types.ObjectId,
  ref: "Employee",
});

const softDeleteFields = () => ({
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedBy: userRef(),
  deletedAt: {
    type: Date,
    default: null,
  },
});

const auditFields = () => ({
  createdBy: userRef(),
  updatedBy: userRef(),
  ...softDeleteFields(),
});

const uploadedDocumentFields = () => ({
  uploadedBy: userRef(),
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: userRef(),
  updatedAt: {
    type: Date,
    default: null,
  },
  ...softDeleteFields(),
});

const storedDocumentFields = (fields) => ({
  type: [
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },
      ...fields,
      documentUrl: {
        type: String,
        default: null,
      },
      notes: {
        type: String,
        trim: true,
      },
      ...uploadedDocumentFields(),
    },
  ],
  default: [],
});

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
      ...employeeRef(),
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
    ...auditFields(),
    labReports: storedDocumentFields({
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
    }),
    medicalDocuments: storedDocumentFields({
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
    }),
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
