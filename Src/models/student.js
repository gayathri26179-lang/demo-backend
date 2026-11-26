const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    course: { type: String, required: true },
    registrationDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
    internshipStatus: {
      type: String,
      enum: ["Active", "Completed", "Pending", "Terminated", "On Hold"],
      default: "Active"
    },
    duration: { type: String, default: "6 Months" },
    attendance: { type: Number, default: 100 },
    progress: { type: Number, default: 0 },
    feeStatus: {
      type: String,
      enum: ["Paid", "Partially Paid", "Pending"],
      default: "Paid"
    },
    totalFee: { type: Number, default: 30000 },
    paidAmount: { type: Number, default: 30000 },
    pendingAmount: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    totalTasks: { type: Number, default: 40 },
    mentor: { type: String, default: "Rajesh K. Sharma" },
    college: { type: String, default: "" },
    certificateId: { type: String, default: null },
    certificateIssued: { type: Boolean, default: false },
    avatar: { type: String, default: "" },
    mode: { type: String, default: "Hybrid (Bangalore Campus + Online)" }
  },
  { timestamps: true }
);

const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);
module.exports = Student;
