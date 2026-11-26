const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    course: { type: String, required: true },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
    mentor: { type: String, default: "Unassigned" },
    status: {
      type: String,
      enum: ["Ongoing", "Completed", "New Application", "Approved", "Rejected", "Terminated"],
      default: "Ongoing"
    },
    college: { type: String, default: "" },
    appliedDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
    evaluationGrade: { type: String, default: "In Progress" },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

const Internship = mongoose.models.Internship || mongoose.model("Internship", internshipSchema);
module.exports = Internship;
