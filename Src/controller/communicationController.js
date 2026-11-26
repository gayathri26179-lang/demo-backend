const storage = require("../services/storage");

// 1. GET ALL COMMUNICATIONS
exports.getAllCommunications = async (req, res) => {
  try {
    const list = storage.find("communications");
    return res.status(200).json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch communications.",
      error: error.message
    });
  }
};

// 2. SEND ANNOUNCEMENT
exports.sendAnnouncement = async (req, res) => {
  try {
    const { title, category, targetAudience, content, sentBy } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and message content are required."
      });
    }

    const all = storage.find("communications");
    const nextNum = all.length + 1;
    const id = `COMM-${nextNum < 10 ? "0" + nextNum : nextNum}`;

    const newComm = storage.create("communications", {
      id,
      title,
      category: category || "General Announcement",
      targetAudience: targetAudience || "All Cohorts",
      sentDate: new Date().toISOString().split("T")[0],
      sentBy: sentBy || (req.user ? req.user.name : "Dr. Maya Raman"),
      status: "Sent",
      content
    });

    // Also broadcast notification
    storage.create("notifications", {
      id: `NOTIF-${Date.now().toString().slice(-4)}`,
      type: "announcement",
      title: `Announcement: ${title}`,
      message: content.slice(0, 100) + (content.length > 100 ? "..." : ""),
      timestamp: "Just now",
      unread: true,
      link: "/communication"
    });

    return res.status(201).json({
      success: true,
      message: "Announcement broadcast successfully.",
      data: newComm
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to broadcast announcement.",
      error: error.message
    });
  }
};

// 3. DELETE COMMUNICATION
exports.deleteCommunication = async (req, res) => {
  try {
    const { id } = req.params;
    storage.findByIdAndDelete("communications", id);

    return res.status(200).json({
      success: true,
      message: "Announcement deleted successfully."
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete communication.",
      error: error.message
    });
  }
};
