const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true, unique: true, trim: true },
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, required: true, enum: ["CASH", "CARD", "UPI"] },
    paidAt: { type: Date, default: Date.now },
    receivedByEmployeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
