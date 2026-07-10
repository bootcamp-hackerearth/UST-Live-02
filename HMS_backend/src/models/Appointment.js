const mongoose = require("mongoose");
const STATUS = require("../constants/status");

const requiredRef = (ref) => ({
  type: mongoose.Schema.Types.ObjectId,
  ref,
  required: true,
});

const nullableRef = (ref) => ({
  type: mongoose.Schema.Types.ObjectId,
  ref,
  default: null,
});

const softDeleteFields = () => ({
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedBy: nullableRef("User"),
  deletedAt: {
    type: Date,
    default: null,
  },
});

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    patientId: {
      ...requiredRef("Patient"),
    },
    doctorEmployeeId: {
      ...requiredRef("Employee"),
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
      ...nullableRef("Employee"),
    },
    createdByPatientId: {
      ...nullableRef("Patient"),
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
      ...nullableRef("User"),
    },
    approvedBy: {
      ...nullableRef("User"),
    },
    approvalDate: {
      type: Date,
      default: null,
    },
    rejectedBy: {
      ...nullableRef("User"),
    },
    rejectedDate: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
    ...softDeleteFields(),
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
