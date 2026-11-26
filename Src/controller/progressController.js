const storage = require("../services/storage");

// 1. GET ALL PROGRESS
exports.getProgress = async (req, res) => {
  try {
    const students = storage.find("students");
    const progressList = students.map(s => ({
      studentId: s.id,
      studentName: s.name,
      course: s.course,
      attendance: s.attendance || 0,
      progressPercentage: s.progress || 0,
      tasksCompleted: s.tasksCompleted || 0,
      totalTasks: s.totalTasks || 40,
      mentor: s.mentor || "Rajesh K. Sharma",
      internshipStatus: s.internshipStatus,
      certificateIssued: s.certificateIssued
    }));

    return res.status(200).json({
      success: true,
      count: progressList.length,
      data: progressList
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student progress.",
      error: error.message
    });
  }
};

// 2. UPDATE PROGRESS FOR A STUDENT
exports.updateProgress = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { progress, tasksCompleted, totalTasks, attendance } = req.body;

    const student = storage.findById("students", studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student "${studentId}" not found.`
      });
    }

    const updates = {};
    if (progress !== undefined) updates.progress = Number(progress);
    if (tasksCompleted !== undefined) updates.tasksCompleted = Number(tasksCompleted);
    if (totalTasks !== undefined) updates.totalTasks = Number(totalTasks);
    if (attendance !== undefined) updates.attendance = Number(attendance);

    const updated = storage.findByIdAndUpdate("students", studentId, updates);

    return res.status(200).json({
      success: true,
      message: "Progress updated successfully.",
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update progress.",
      error: error.message
    });
  }
};
