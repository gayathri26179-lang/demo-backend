const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    name: { type: String, required: true },
    category: { type: String, default: "Full Stack" },
    duration: { type: String, default: "6 Months" },
    fee: { type: Number, required: true },
    status: { type: String, enum: ["Active", "Inactive", "Upcoming"], default: "Active" },
    enrolledCount: { type: Number, default: 0 },
    modulesCount: { type: Number, default: 20 },
    image: { type: String, default: "" },
    description: { type: String, default: "" }
  },
  { timestamps: true }
);

const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);
module.exports = Course;
