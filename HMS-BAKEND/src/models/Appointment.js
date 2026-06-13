const mongoose = require("mongoose");
const STATUS = require("../constants/status");

const appointmentSchema = new mongoose.Schema(
  {
    // -------------------------
    // BASIC IDENTIFIERS
    // -------------------------
    appointmentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctorEmployeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    createdByEmployeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    // -------------------------
    // APPOINTMENT DETAILS
    // -------------------------
    appointmentDate: {
      type: Date,
      required: true,
    },

    timeSlot: {
      type: String,
      required: true,
      trim: true,
    },

    tokenNumber: {
      type: Number,
    },

    appointmentType: {
      type: String,
      enum: [
        "CONSULTATION",
        "FOLLOW_UP",
        "EMERGENCY",
        "VIDEO_CONSULTATION",
        "ROUTINE_CHECKUP",
      ],
      default: "CONSULTATION",
    },

    priority: {
      type: String,
      enum: ["NORMAL", "URGENT", "CRITICAL"],
      default: "NORMAL",
    },

    visitMode: {
      type: String,
      enum: ["OFFLINE", "ONLINE", "HOME_VISIT"],
      default: "OFFLINE",
    },

    symptoms: [
      {
        type: String,
      },
    ],

    // -------------------------
    // PAYMENT
    // -------------------------
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "INSURANCE"],
      default: "PENDING",
    },

    // -------------------------
    // LIFECYCLE STATUS (REAL APPOINTMENT STATUS)
    // -------------------------
    status: {
      type: String,
      enum: [
        STATUS.BOOKED,
        STATUS.CANCELLED,
        STATUS.COMPLETED,
        STATUS.IN_CONSULTATION,
        STATUS.NO_SHOW,
      ],
      default: STATUS.BOOKED,
    },

    // -------------------------
    // APPROVAL WORKFLOW (NEW)
    // -------------------------
    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    approvalActionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    approvalActionAt: {
      type: Date,
    },

    rejectionReason: {
      type: String,
      default: null,
    },

    // -------------------------
    // UPDATE REQUEST SYSTEM
    // -------------------------

    updateReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Appointment =
  mongoose.models.Appointment ||
  mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
