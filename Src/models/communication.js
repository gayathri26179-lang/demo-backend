const mongoose = require("mongoose");

const communicationSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    title: { type: String, required: true },
    category: { type: String, default: "General Announcement" },
    targetAudience: { type: String, default: "All Cohorts" },
    sentDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
    sentBy: { type: String, default: "Administration" },
    status: { type: String, default: "Sent" },
    content: { type: String, required: true }
  },
  { timestamps: true }
);

const Communication = mongoose.models.Communication || mongoose.model("Communication", communicationSchema);
module.exports = Communication;
