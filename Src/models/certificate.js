const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    courseName: { type: String, required: true },
    duration: { type: String, default: "6 Months" },
    issueDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
    theme: { type: String, enum: ["navy", "purple", "pink"], default: "navy" },
    grade: { type: String, default: "A+ (Distinction)" },
    authorizedSignatory: { type: String, default: "Dr. Maya Raman (Managing Director)" },
    technicalLead: { type: String, default: "Rajesh K. Sharma (Technical Head)" },
    company: { type: String, default: "AR IT COMPANY" },
    verificationCode: { type: String, unique: true, required: true },
    skills: { type: String, default: "" }
  },
  { timestamps: true }
);

const Certificate = mongoose.models.Certificate || mongoose.model("Certificate", certificateSchema);
module.exports = Certificate;
