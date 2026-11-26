const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    type: { type: String, default: "system" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: String, default: () => "Just now" },
    unread: { type: Boolean, default: true },
    link: { type: String, default: "/dashboard" }
  },
  { timestamps: true }
);

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
module.exports = Notification;
