const mongoose = require("mongoose");
const Counter = require("./Counter");

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true, trim: true, uppercase: true },
  name:        { type: String, required: true },
  phone:       { type: String, required: true },
  email:       { type: String, required: true, unique: true, lowercase: true },

  department: {
    type: String,
    enum: ["OPD", "IPD", "LAB", "PHARMACY", "ADMIN"],
    required: true,
  },
  designation: {
    type: String,
    enum: ["OWNER", "DOCTOR", "NURSE", "RECEPTIONIST", "CASHIER", "LAB_TECH", "PHARMACIST", "ADMIN"],
    required: true,
  },

  joiningDate:               { type: Date, required: true },
  medicalRegistrationNumber: { type: String, unique: true, sparse: true },
  specialisation:            { type: String },
  qualification:             [{ type: String }],
  consultationFee:           { type: Number },

  availabilitySlots: {
    type: [
      {
        day: {
          type: String,
          enum: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
          required: true,
        },
        startTime: { type: String, required: true },
        endTime:   { type: String, required: true },
      },
    ],
    default: undefined,
  },
});

employeeSchema.pre("save", async function () {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { name: "Employee" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.employeeId = `EMP-${String(counter.seq).padStart(6, "0")}`;
  }
});

module.exports = mongoose.model("Employee", employeeSchema);