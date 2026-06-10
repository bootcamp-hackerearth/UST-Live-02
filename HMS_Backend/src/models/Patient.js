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
      required: true,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      required: true,
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Patient", patientSchema);