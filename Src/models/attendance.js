const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    id: { type: String },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    course: { type: String, default: "" },
    date: { type: String, required: true },
    status: {
      type: String,
      enum: ["Present", "Absent", "Leave", "Late"],
      default: "Present"
    },
    markedAt: { type: String, default: () => new Date().toLocaleTimeString() },
    reason: { type: String, default: "" }
  },
  { timestamps: true }
);

const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
module.exports = Attendance;
