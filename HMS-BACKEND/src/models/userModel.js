const mongoose = require("mongoose");
const Counter = require("./counterModel"); 

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    verificationToken: String,
    verificationTokenExpiry: Date,
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "INACTIVE",
    },
    roles: {
      type: [String],
      enum: [
        "OWNER",
        "ADMIN",
        "DOCTOR",
        "RECEPTIONIST",
        "CASHIER",
        "NURSE",
        "LAB_TECH",
        "PHARMACIST",
      ],
    },
    employeeId: {
      type: String,
      ref: "Employee",
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.userId) {
    const seq = await Counter.getNextSequence("userId");
    this.userId = `USR-${String(seq).padStart(4, "0")}`;
  }
});

module.exports = mongoose.model("User", userSchema);