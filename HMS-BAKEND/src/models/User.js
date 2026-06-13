const mongoose = require("mongoose");
const ROLES = require("../constants/roles");
const STATUS = require("../constants/status");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    passwordHash: {
      type: String,
      default: null,
    },

    temporaryPasswordHash: {
      type: String,
      default: null,
    },

    roles: {
      type: [String],
      enum: Object.values(ROLES),
      required: true,
    },

    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    patientId: {
      type: String,
    },
    // Tracks whether the user has completed first-time login setup
    isFirstLogin: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.PENDING,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    // Password recovery question
    securityQuestion: {
      type: String,
      default: null,
    },

    // Hashed answer for password recovery
    securityAnswer: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const User = mongoose.model("User", userSchema);

module.exports = User;
