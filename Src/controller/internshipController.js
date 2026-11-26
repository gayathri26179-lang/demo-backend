const storage = require("../services/storage");

// 1. GET ALL INTERNSHIPS
exports.getAllInternships = async (req, res) => {
  try {
    const { status, mentor, course } = req.query;
    let internships = storage.find("internships");

    if (status && status !== "All") {
      internships = internships.filter(i => i.status && i.status.toLowerCase() === status.toLowerCase());
    }
    if (mentor) {
      internships = internships.filter(i => i.mentor && i.mentor.toLowerCase() === mentor.toLowerCase());
    }
    if (course) {
      internships = internships.filter(i => i.course && i.course.toLowerCase() === course.toLowerCase());
    }

    return res.status(200).json({
      success: true,
      count: internships.length,
      data: internships
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch internships.",
      error: error.message
    });
  }
};

// 2. GET INTERNSHIP BY ID
exports.getInternshipById = async (req, res) => {
  try {
    const { id } = req.params;
    const internship = storage.findById("internships", id);

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: `Internship with ID "${id}" not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: internship
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch internship details.",
      error: error.message
    });
  }
};

// 3. UPDATE STATUS
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, evaluationGrade, notes, mentor } = req.body;

    const existing = storage.findById("internships", id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Internship with ID "${id}" not found.`
      });
    }

    const updates = {};
    if (status) updates.status = status;
    if (evaluationGrade) updates.evaluationGrade = evaluationGrade;
    if (notes) updates.notes = notes;
    if (mentor) updates.mentor = mentor;

    const updated = storage.findByIdAndUpdate("internships", id, updates);

    // Also update student's internshipStatus if status changed to Ongoing or Completed
    if (existing.studentId && status) {
      const studentStatusMap = {
        Ongoing: "Active",
        Completed: "Completed",
        Terminated: "Terminated",
        Approved: "Active"
      };
      if (studentStatusMap[status]) {
        storage.findByIdAndUpdate("students", existing.studentId, {
          internshipStatus: studentStatusMap[status]
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Internship status updated to "${status || existing.status}".`,
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update internship status.",
      error: error.message
    });
  }
};

// 4. ASSIGN MENTOR
exports.assignMentor = async (req, res) => {
  try {
    const { id } = req.params;
    const { mentor } = req.body;

    if (!mentor) {
      return res.status(400).json({
        success: false,
        message: "Mentor name is required."
      });
    }

    const existing = storage.findById("internships", id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Internship with ID "${id}" not found.`
      });
    }

    const updated = storage.findByIdAndUpdate("internships", id, { mentor });

    // Sync to student record as well
    if (existing.studentId) {
      storage.findByIdAndUpdate("students", existing.studentId, { mentor });
    }

    return res.status(200).json({
      success: true,
      message: `Mentor "${mentor}" assigned successfully.`,
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to assign mentor.",
      error: error.message
    });
  }
};

// 5. CREATE INTERNSHIP
exports.createInternship = async (req, res) => {
  try {
    const { studentId, studentName, course, startDate, endDate, mentor, college, notes } = req.body;

    if (!studentName || !course) {
      return res.status(400).json({
        success: false,
        message: "Student name and course are required."
      });
    }

    const all = storage.find("internships");
    const id = `INT-APP-${100 + all.length + 1}`;

    const newInternship = storage.create("internships", {
      id,
      studentId: studentId || `ARIT-2026-STU${100 + all.length + 1}`,
      studentName,
      course,
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate: endDate || "2027-05-30",
      mentor: mentor || "Unassigned",
      status: "Ongoing",
      college: college || "",
      appliedDate: new Date().toISOString().split("T")[0],
      evaluationGrade: "In Progress",
      notes: notes || ""
    });

    return res.status(201).json({
      success: true,
      message: "Internship record created successfully.",
      data: newInternship
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create internship record.",
      error: error.message
    });
  }
};

// 6. DELETE INTERNSHIP
exports.deleteInternship = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = storage.findById("internships", id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Internship with ID "${id}" not found.`
      });
    }

    storage.findByIdAndDelete("internships", id);

    return res.status(200).json({
      success: true,
      message: "Internship record deleted successfully."
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete internship record.",
      error: error.message
    });
  }
};
