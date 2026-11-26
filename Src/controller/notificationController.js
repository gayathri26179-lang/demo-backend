const storage = require("../services/storage");

// 1. GET ALL NOTIFICATIONS
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = storage.find("notifications");
    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount: notifications.filter(n => n.unread).length,
      data: notifications
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
      error: error.message
    });
  }
};

// 2. MARK AS READ
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = storage.findById("notifications", id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Notification "${id}" not found.`
      });
    }

    const updated = storage.findByIdAndUpdate("notifications", id, { unread: false });

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update notification.",
      error: error.message
    });
  }
};

// 3. MARK ALL AS READ
exports.markAllAsRead = async (req, res) => {
  try {
    const notifications = storage.find("notifications");
    for (const n of notifications) {
      if (n.unread) {
        storage.findByIdAndUpdate("notifications", n.id, { unread: false });
      }
    }

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read."
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update notifications.",
      error: error.message
    });
  }
};

// 4. CREATE NOTIFICATION
exports.createNotification = async (req, res) => {
  try {
    const { type, title, message, link } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required."
      });
    }

    const all = storage.find("notifications");
    const id = `NOTIF-${all.length + 1}`;

    const newNotif = storage.create("notifications", {
      id,
      type: type || "system",
      title,
      message,
      timestamp: "Just now",
      unread: true,
      link: link || "/dashboard"
    });

    return res.status(201).json({
      success: true,
      data: newNotif
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create notification.",
      error: error.message
    });
  }
};

// 5. DELETE NOTIFICATION
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    storage.findByIdAndDelete("notifications", id);

    return res.status(200).json({
      success: true,
      message: "Notification dismissed."
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete notification.",
      error: error.message
    });
  }
};
