const mongoose = require("mongoose");

const softDeleteFields = {
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
};

const auditFields = {
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
  ...softDeleteFields,
};

const approvalFields = {
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  approvalDate: {
    type: Date,
    default: null,
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
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
};

const documentTrackingFields = {
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
  ...softDeleteFields,
};

module.exports = { auditFields, softDeleteFields, approvalFields, documentTrackingFields };
