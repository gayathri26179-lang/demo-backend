const mongoose = require("mongoose");

const mentorSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    specialization: { type: String, default: "" },
    assignedCourse: { type: String, default: "" },
    activeStudentsCount: { type: Number, default: 0 },
    phone: { type: String, default: "" },
    avatar: { type: String, default: "" },
    experience: { type: String, default: "5+ Years" }
  },
  { timestamps: true }
);

const Mentor = mongoose.models.Mentor || mongoose.model("Mentor", mentorSchema);
module.exports = Mentor;
