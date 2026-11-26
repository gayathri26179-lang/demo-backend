const storage = require("../services/storage");

// 1. GET ATTENDANCE RECORDS
exports.getAttendance = async (req, res) => {
  try {
    const { date, studentId } = req.query;
    let attendance = storage.find("attendance");

    if (date) {
      attendance = attendance.filter(a => a.date === date);
    }
    if (studentId) {
      attendance = attendance.filter(a => a.studentId === studentId);
    }

    return res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance records.",
      error: error.message
    });
  }
};

// 2. MARK ATTENDANCE (Single or Batch)
exports.markAttendance = async (req, res) => {
  try {
    const { records, date, studentId, status, reason } = req.body;
    const targetDate = date || new Date().toISOString().split("T")[0];

    // Batch marking
    if (Array.isArray(records)) {
      const updatedList = [];
      for (const rec of records) {
        const student = storage.findById("students", rec.studentId);
        const existing = storage.findOne("attendance", {
          studentId: rec.studentId,
          date: targetDate
        });

        if (existing) {
          const updated = storage.findByIdAndUpdate("attendance", existing.id || existing._id, {
            status: rec.status,
            markedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            reason: rec.reason || existing.reason
          });
          updatedList.push(updated);
        } else {
          const created = storage.create("attendance", {
            studentId: rec.studentId,
            studentName: student ? student.name : rec.studentName || "Student",
            course: student ? student.course : rec.course || "",
            date: targetDate,
            status: rec.status || "Present",
            markedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            reason: rec.reason || ""
          });
          updatedList.push(created);
        }
      }

      return res.status(200).json({
        success: true,
        message: `Attendance marked for ${records.length} student(s) on ${targetDate}.`,
        data: updatedList
      });
    }

    // Single student marking
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId or array of records is required."
      });
    }

    const student = storage.findById("students", studentId);
    const existing = storage.findOne("attendance", { studentId, date: targetDate });

    let result;
    if (existing) {
      result = storage.findByIdAndUpdate("attendance", existing.id || existing._id, {
        status: status || existing.status,
        reason: reason !== undefined ? reason : existing.reason,
        markedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      });
    } else {
      result = storage.create("attendance", {
        studentId,
        studentName: student ? student.name : "Student",
        course: student ? student.course : "",
        date: targetDate,
        status: status || "Present",
        markedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        reason: reason || ""
      });
    }

    return res.status(200).json({
      success: true,
      message: `Attendance recorded for ${student ? student.name : studentId}.`,
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to mark attendance.",
      error: error.message
    });
  }
};

// 3. ATTENDANCE SUMMARY
exports.getAttendanceSummary = async (req, res) => {
  try {
    const attendance = storage.find("attendance");
    const totalRecords = attendance.length;
    const presentCount = attendance.filter(a => a.status === "Present").length;
    const absentCount = attendance.filter(a => a.status === "Absent").length;
    const leaveCount = attendance.filter(a => a.status === "Leave").length;

    const overallPercentage = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 100;

    return res.status(200).json({
      success: true,
      data: {
        totalRecords,
        presentCount,
        absentCount,
        leaveCount,
        overallPercentage
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to calculate attendance summary.",
      error: error.message
    });
  }
};
