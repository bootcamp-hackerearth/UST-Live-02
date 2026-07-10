const mongoose = require("mongoose");
const ROLES = require("../constants/roles");
const STATUS = require("../constants/status");

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

const auditFields = () => ({
  createdBy: nullableRef("User"),
  updatedBy: nullableRef("User"),
  ...softDeleteFields(),
});

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
      ...nullableRef("Employee"),
    },
    patientId: {
      ...nullableRef("Patient"),
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
    ...auditFields(),
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
