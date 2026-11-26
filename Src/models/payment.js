const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    course: { type: String, required: true },
    courseFee: { type: Number, required: true },
    amountPaid: { type: Number, required: true },
    pendingAmount: { type: Number, default: 0 },
    paymentDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Partially Paid", "Pending"],
      default: "Paid"
    },
    method: { type: String, default: "Online Transfer" },
    receiptNo: { type: String, default: "" }
  },
  { timestamps: true }
);

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
module.exports = Payment;
