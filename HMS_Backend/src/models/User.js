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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
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

    // Refresh token for authentication
    refreshToken: {
      type: String,
      default: null,
    },

    // Password recovery
    securityQuestion: {
      type: String,
      default: null,
    },

    securityAnswer: {
      type: String,
      default: null,
    },

    // Audit fields
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
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes

userSchema.index({ status: 1 });
userSchema.index({ employeeId: 1 });
userSchema.index({ patientId: 1 });
userSchema.index({ status: 1, isDeleted: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;
