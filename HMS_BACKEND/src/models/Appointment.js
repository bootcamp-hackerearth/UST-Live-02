const mongoose = require("mongoose");
const STATUS = require("../constants/status");
const { softDeleteFields, approvalFields } = require("../utils/schemaFields");

const appointmentSchema = new mongoose.Schema(
  {
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
    status: {
      type: String,
      enum: [
        STATUS.PENDING,
        STATUS.BOOKED,
        STATUS.REJECTED,
        STATUS.CANCELLED,
        STATUS.COMPLETED,
        STATUS.IN_CONSULTATION,
        STATUS.NO_SHOW,
      ],
      default: STATUS.BOOKED,
    },
    createdByEmployeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    createdByPatientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
    },
    // Type of appointment
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
    // Appointment priority level
    priority: {
      type: String,
      enum: ["NORMAL", "URGENT", "CRITICAL"],
      default: "NORMAL",
    },
    // Payment status of the appointment
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "INSURANCE"],
      default: "PENDING",
    },
    // Consultation mode
    visitMode: {
      type: String,
      enum: ["OFFLINE", "ONLINE", "HOME_VISIT"],
      default: "OFFLINE",
    },
    // Patient symptoms
    symptoms: [
      {
        type: String,
      },
    ],
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    ...approvalFields,
    ...softDeleteFields,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
appointmentSchema.index({
  status: 1,
  isDeleted: 1,
});

appointmentSchema.index({
  patientId: 1,
  status: 1,
  isDeleted: 1,
});

appointmentSchema.index({
  doctorEmployeeId: 1,
  appointmentDate: 1,
  isDeleted: 1,
});
appointmentSchema.index({
  status: 1,
  appointmentDate: 1,
  isDeleted: 1,
});

appointmentSchema.index({
  doctorEmployeeId: 1,
  status: 1,
  isDeleted: 1,
});
const Appointment =
  mongoose.models.Appointment ||
  mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
