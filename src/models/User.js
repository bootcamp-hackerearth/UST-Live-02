const mongoose = require("mongoose");
const ROLES = require("../constants/roles");
const STATUS = require("../constants/status");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true,},
    passwordHash: { type: String, default: null },
    temporaryPasswordHash: { type: String, default: null },
    roles: { type: [String], enum: Object.values(ROLES), required: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null,},
    isFirstLogin: { type: Boolean, default: true },
    status: { type: String, enum: Object.values(STATUS), default: STATUS.PENDING,},
    lastLoginAt: { type: Date, default: null },
    
    securityQuestion: { type: String,  default: null,},
    securityAnswer: {type: String,default: null,},
  },
  {
    timestamps: true, versionKey: false,
  },
);
const User = mongoose.model("User", userSchema);
module.exports = User;
