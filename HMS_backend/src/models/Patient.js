const mongoose = require("mongoose");

const healthRecordSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    documentType: {
      type: String,
      required: true,
      enum: [
        "PREVIOUS_DISCHARGE_SUMMARY",
        "LAB_REPORT",
        "SCAN_REPORT",
        "OTHER",
      ],
    },

    documentDate: {
      type: Date,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    originalFileName: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

    deletedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const patientSchema = new mongoose.Schema(
  {
    // Basic patient information
    patientId: {
      type: String,
      required: true,
      unique: true,
    },

    UHID: {
      type: String,
      trim: true,
      select: false,
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

    taluk: {
      type: String,
    },

    postOffice: {
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

    healthRecords: [healthRecordSchema],

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

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    deletedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

patientSchema.index({
  status: 1,
  isDeleted: 1,
  createdAt: -1,
});

patientSchema.index({
  assignedDoctor: 1,
  isDeleted: 1,
});

patientSchema.index({
  firstName: 1,
  lastName: 1,
  isDeleted: 1,
});

patientSchema.index({
  "healthRecords._id": 1,
});

patientSchema.index({
  "healthRecords.documentType": 1,
  isDeleted: 1,
});

module.exports = mongoose.model("Patient", patientSchema);
