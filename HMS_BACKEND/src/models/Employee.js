const mongoose = require("mongoose");
const STATUS = require("../constants/status");
const { auditFields, approvalFields } = require("../utils/schemaFields");

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      required: true,
    },
    countryCode: {
      type: String,
      required: true,
      default: "+91",
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: /^\d{10}$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    joiningDate: {
      type: Date,
      required: true,
    },
    medicalRegistrationNo: {
      type: String,
      trim: true,
      default: null,
      unique: true,
      sparse: true,
    },
    specialization: {
      type: String,
      trim: true,
      default: null,
    },
    qualification: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: [STATUS.ACTIVE, STATUS.INACTIVE, STATUS.PENDING, STATUS.REJECTED],
      default: STATUS.PENDING,
    },
    availabilitySlots: {
      type: [String],
      default: [],
    },
    consultationFee: {
      type: Number,
      default: 0,
    },
    availability: {
      workingDays: [
        {
          type: String,
        },
      ],
      startTime: {
        type: String,
      },
      endTime: {
        type: String,
      },
      slotDuration: {
        type: Number,
        default: 15,
      },
      breakStartTime: {
        type: String,
      },
      breakEndTime: {
        type: String,
      },
      maxPatientsPerDay: {
        type: Number,
        default: 40,
      },
      isAvailable: {
        type: Boolean,
        default: true,
      },
    },
    ...auditFields,
    ...approvalFields,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

employeeSchema.index({
  status: 1,
  isDeleted: 1,
});
employeeSchema.index({
  designation: 1,
  isDeleted: 1,
});

employeeSchema.index({
  status: 1,
  department: 1,
  isDeleted: 1,
});
module.exports = mongoose.model("Employee", employeeSchema);
