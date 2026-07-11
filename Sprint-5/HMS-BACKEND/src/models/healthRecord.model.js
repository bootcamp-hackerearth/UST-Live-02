const mongoose = require('mongoose');
const Counter = require('./Counter.model');

const prescriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    dosage: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: String,
      required: true,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const healthRecordSchema = new mongoose.Schema(
  {
    medicalRecordId: {
      type: String,
      unique: true
    },

    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },

    symptomsReason: {
      type: String,
      required: true,
      trim: true
    },

    diagnosis: {
      type: String,
      required: true,
      trim: true
    },

    prescription: {
      type: [prescriptionSchema],
      default: []
    },

    notes: {
      type: String,
      trim: true
    },

    status: {
      type: String,
      enum: ['DRAFT', 'FINALIZED'],
      default: 'DRAFT'
    },

    finalizedAt: {
      type: Date,
      default: null
    },

    finalizedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },

    isDeleted: {
      type: Boolean,
      default: false
    },

    deletedAt: {
      type: Date,
      default: null
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

healthRecordSchema.pre('save', async function () {
  if (this.medicalRecordId) {
    return;
  }

  const counter = await Counter.findOneAndUpdate(
    { name: 'medicalRecord' },
    { $inc: { seq: 1 } },
    {
      returnDocument: 'after',
      upsert: true
    }
  );

  this.medicalRecordId = `MR-${String(counter.seq).padStart(6, '0')}`;
});
module.exports =
  mongoose.models.HealthRecord || mongoose.model('HealthRecord', healthRecordSchema);