const storage = require("../services/storage");

// 1. GET ALL ACTIVITIES
exports.getAllActivities = async (req, res) => {
  try {
    const { studentId, status, date } = req.query;
    let activities = storage.find("dailyActivities");

    if (studentId) {
      activities = activities.filter(a => a.studentId === studentId);
    }
    if (status && status !== "All") {
      activities = activities.filter(a => a.taskStatus && a.taskStatus.toLowerCase() === status.toLowerCase());
    }
    if (date) {
      activities = activities.filter(a => a.activityDate === date);
    }

    return res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch daily activities.",
      error: error.message
    });
  }
};

// 2. GET ACTIVITY BY ID
exports.getActivityById = async (req, res) => {
  try {
    const { id } = req.params;
    const activity = storage.findById("dailyActivities", id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: `Activity with ID "${id}" not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: activity
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch activity details.",
      error: error.message
    });
  }
};

// 3. CREATE ACTIVITY
exports.createActivity = async (req, res) => {
  try {
    const { studentId, studentName, course, dayNumber, taskTitle, workDescription, activityDate } = req.body;

    if (!studentName || !taskTitle || !workDescription) {
      return res.status(400).json({
        success: false,
        message: "Student name, task title, and work description are required."
      });
    }

    const all = storage.find("dailyActivities");
    const nextNum = all.length + 1;
    const id = `ACT-${nextNum < 10 ? "0" + nextNum : nextNum}`;

    const newActivity = storage.create("dailyActivities", {
      id,
      studentId: studentId || "ARIT-2026-STU01",
      studentName,
      course: course || "Full Stack Development",
      dayNumber: dayNumber || `Day ${nextNum}`,
      activityDate: activityDate || new Date().toISOString().split("T")[0],
      taskTitle,
      workDescription,
      taskStatus: "Pending Review",
      mentorFeedback: "",
      mentorName: ""
    });

    // Create notification for admin / mentor
    storage.create("notifications", {
      id: `NOTIF-${Date.now().toString().slice(-4)}`,
      type: "activity",
      title: "Daily Activity Submitted",
      message: `${studentName} submitted ${newActivity.dayNumber} – ${taskTitle} for review.`,
      timestamp: "Just now",
      unread: true,
      link: "/daily-activities"
    });

    return res.status(201).json({
      success: true,
      message: "Daily activity submitted successfully.",
      data: newActivity
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit activity.",
      error: error.message
    });
  }
};

// 4. ADD MENTOR FEEDBACK
exports.addMentorFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback, status, mentorName } = req.body;

    const existing = storage.findById("dailyActivities", id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Activity with ID "${id}" not found.`
      });
    }

    const updated = storage.findByIdAndUpdate("dailyActivities", id, {
      mentorFeedback: feedback || existing.mentorFeedback,
      taskStatus: status || "Approved",
      mentorName: mentorName || (req.user ? req.user.name : "Rajesh K. Sharma")
    });

    return res.status(200).json({
      success: true,
      message: "Mentor feedback added successfully.",
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add mentor feedback.",
      error: error.message
    });
  }
};

// 5. DELETE ACTIVITY
exports.deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = storage.findById("dailyActivities", id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Activity with ID "${id}" not found.`
      });
    }

    storage.findByIdAndDelete("dailyActivities", id);

    return res.status(200).json({
      success: true,
      message: "Daily activity deleted successfully."
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete activity.",
      error: error.message
    });
  }
};

exports.addFeedback = exports.addMentorFeedback;
