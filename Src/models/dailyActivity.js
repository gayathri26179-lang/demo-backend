const mongoose = require("mongoose");

const dailyActivitySchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    course: { type: String, required: true },
    dayNumber: { type: String, default: "Day 1" },
    activityDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
    taskTitle: { type: String, required: true },
    workDescription: { type: String, required: true },
    taskStatus: {
      type: String,
      enum: ["Approved", "Pending Review", "Needs Revision", "Submitted"],
      default: "Pending Review"
    },
    mentorFeedback: { type: String, default: "" },
    mentorName: { type: String, default: "" }
  },
  { timestamps: true }
);

const DailyActivity = mongoose.models.DailyActivity || mongoose.model("DailyActivity", dailyActivitySchema);
module.exports = DailyActivity;
