const storage = require("../services/storage");

exports.getReports = async (req, res) => {
  try {
    const students = storage.find("students");
    const courses = storage.find("courses");
    const internships = storage.find("internships");
    const payments = storage.find("payments");
    const certificates = storage.find("certificates");
    const attendance = storage.find("attendance");

    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.internshipStatus === "Active").length;
    const completedInternships = students.filter(s => s.internshipStatus === "Completed").length;
    const pendingApplications = internships.filter(i => i.status === "New Application" || i.status === "Pending").length;
    const totalCourses = courses.length;

    const totalRevenue = payments.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
    const totalPendingDues = students.reduce((sum, s) => sum + (Number(s.pendingAmount) || 0), 0);
    const certificatesIssued = certificates.length;

    // Course Enrollment Distribution
    const courseDistribution = courses.map(c => {
      const enrolled = students.filter(s => s.course && s.course.toLowerCase() === c.name.toLowerCase()).length;
      return {
        courseId: c.id,
        courseName: c.name,
        enrolledCount: enrolled,
        percentage: totalStudents > 0 ? Math.round((enrolled / totalStudents) * 100) : 0
      };
    });

    // Attendance stats
    const totalAttendanceDays = attendance.length;
    const presentRecords = attendance.filter(a => a.status === "Present").length;
    const overallAttendanceRate = totalAttendanceDays > 0 ? Math.round((presentRecords / totalAttendanceDays) * 100) : 95;

    return res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalStudents,
          activeStudents,
          completedInternships,
          pendingApplications,
          totalCourses,
          totalRevenue,
          totalPendingDues,
          certificatesIssued,
          overallAttendanceRate
        },
        courseDistribution,
        recentStudents: students.slice(0, 5),
        recentPayments: payments.slice(0, 5),
        recentCertificates: certificates.slice(0, 5)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate report analytics.",
      error: error.message
    });
  }
};
