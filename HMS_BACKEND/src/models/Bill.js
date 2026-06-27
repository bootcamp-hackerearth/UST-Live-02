const mongoose = require("mongoose");
const STATUS = require("../constants/status");

// Individual bill item
const billItemSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const billSchema = new mongoose.Schema(
  {
    billId: {
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

    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },

    // Services included in the bill
    items: {
      type: [billItemSchema],
      default: [],
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [STATUS.PENDING, STATUS.PAID],
      default: STATUS.PENDING,
    },

    createdByEmployeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Bill = mongoose.model("Bill", billSchema);

module.exports = Bill;