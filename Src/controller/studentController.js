const storage = require("../services/storage");

// 1. GET ALL STUDENTS (Supports filter & search)
exports.getAllStudents = async (req, res) => {
  try {
    const { course, status, search } = req.query;
    let students = storage.find("students");

    if (course && course !== "All") {
      students = students.filter(s => s.course && s.course.toLowerCase() === course.toLowerCase());
    }

    if (status && status !== "All") {
      students = students.filter(s => s.internshipStatus && s.internshipStatus.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      students = students.filter(s =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.id && s.id.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.course && s.course.toLowerCase().includes(q))
      );
    }

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch students.",
      error: error.message
    });
  }
};

// 2. GET STUDENT BY ID
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = storage.findById("students", id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with ID "${id}" not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student profile.",
      error: error.message
    });
  }
};

// 3. CREATE STUDENT
exports.createStudent = async (req, res) => {
  try {
    const studentData = req.body;
    if (!studentData.name || !studentData.course) {
      return res.status(400).json({
        success: false,
        message: "Student name and course are required."
      });
    }

    const allStudents = storage.find("students");
    const nextNumber = allStudents.length + 1;
    const formattedId = studentData.id || `ARIT-2026-STU${nextNumber < 10 ? "0" + nextNumber : nextNumber}`;

    const totalFee = Number(studentData.totalFee) || 30000;
    const paidAmount = Number(studentData.paidAmount) || 30000;
    const pendingAmount = Math.max(0, totalFee - paidAmount);
    const feeStatus = pendingAmount === 0 ? "Paid" : paidAmount > 0 ? "Partially Paid" : "Pending";

    const newStudent = storage.create("students", {
      id: formattedId,
      name: studentData.name,
      email: studentData.email || `${studentData.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      phone: studentData.phone || "+91 98000 00000",
      address: studentData.address || "AR IT Bangalore Campus",
      course: studentData.course,
      registrationDate: studentData.registrationDate || new Date().toISOString().split("T")[0],
      internshipStatus: studentData.internshipStatus || "Active",
      duration: studentData.duration || "6 Months",
      attendance: 100,
      progress: 0,
      feeStatus,
      totalFee,
      paidAmount,
      pendingAmount,
      tasksCompleted: 0,
      totalTasks: 40,
      mentor: studentData.mentor || "Rajesh K. Sharma",
      college: studentData.college || "Engineering Institute",
      certificateId: null,
      certificateIssued: false,
      avatar: studentData.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      mode: studentData.mode || "Hybrid (Bangalore Campus + Online)"
    });

    // Auto-create linked internship record
    const newInternship = storage.create("internships", {
      id: `INT-APP-${100 + nextNumber}`,
      studentId: newStudent.id,
      studentName: newStudent.name,
      course: newStudent.course,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "2027-05-30",
      mentor: newStudent.mentor,
      status: "Ongoing",
      college: newStudent.college,
      appliedDate: newStudent.registrationDate,
      evaluationGrade: "In Progress",
      notes: "Directly enrolled via AR IT COMPANY CRM portal."
    });

    // Auto-create initial payment record if paidAmount > 0
    let newPayment = null;
    if (paidAmount > 0) {
      newPayment = storage.create("payments", {
        id: `TXN-ARIT-${8900 + nextNumber}`,
        studentId: newStudent.id,
        studentName: newStudent.name,
        course: newStudent.course,
        courseFee: totalFee,
        amountPaid: paidAmount,
        pendingAmount,
        paymentDate: newStudent.registrationDate,
        paymentStatus: feeStatus,
        method: "Online Transfer",
        receiptNo: `REC-2026-${100 + nextNumber}`
      });
    }

    // Auto-create notification
    storage.create("notifications", {
      id: `NOTIF-${Date.now().toString().slice(-4)}`,
      type: "registration",
      title: "New Student Added",
      message: `${newStudent.name} enrolled in ${newStudent.course}.`,
      timestamp: "Just now",
      unread: true,
      link: "/students"
    });

    return res.status(201).json({
      success: true,
      message: `Student ${newStudent.name} registered successfully.`,
      data: newStudent,
      internship: newInternship,
      payment: newPayment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create student.",
      error: error.message
    });
  }
};

// 4. UPDATE STUDENT
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = storage.findById("students", id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Student with ID "${id}" not found.`
      });
    }

    const updates = { ...req.body };
    if (updates.totalFee !== undefined || updates.paidAmount !== undefined) {
      const totalFee = Number(updates.totalFee !== undefined ? updates.totalFee : existing.totalFee);
      const paidAmount = Number(updates.paidAmount !== undefined ? updates.paidAmount : existing.paidAmount);
      updates.totalFee = totalFee;
      updates.paidAmount = paidAmount;
      updates.pendingAmount = Math.max(0, totalFee - paidAmount);
      updates.feeStatus = updates.pendingAmount === 0 ? "Paid" : paidAmount > 0 ? "Partially Paid" : "Pending";
    }

    const updated = storage.findByIdAndUpdate("students", id, updates);

    return res.status(200).json({
      success: true,
      message: "Student profile updated successfully.",
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update student.",
      error: error.message
    });
  }
};

// 5. DELETE STUDENT (Cascades to related records)
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = storage.findById("students", id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Student with ID "${id}" not found.`
      });
    }

    storage.findByIdAndDelete("students", id);
    storage.deleteMany("internships", { studentId: id });
    storage.deleteMany("payments", { studentId: id });
    storage.deleteMany("dailyActivities", { studentId: id });
    storage.deleteMany("attendance", { studentId: id });

    return res.status(200).json({
      success: true,
      message: `Student ${existing.name} (${id}) and related records deleted successfully.`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete student.",
      error: error.message
    });
  }
};

// 6. SYNC WEBSITE REGISTRATIONS
exports.syncWebsiteRegistrations = async (req, res) => {
  try {
    const incomingCandidates = [
      {
        name: "Abhishek Mukherjee",
        email: "abhishek.m@candidate.aritcompany.com",
        phone: "+91 98311 44556",
        course: "Full Stack Development",
        college: "Heritage Institute of Technology, Kolkata",
        address: "New Town, Action Area II, Kolkata - 700156",
        mode: "Online Live",
        totalFee: 35000,
        paidAmount: 35000
      },
      {
        name: "Nandini Iyer",
        email: "nandini.i@candidate.aritcompany.com",
        phone: "+91 94445 77889",
        course: "UI/UX Design",
        college: "SSN College of Engineering, Chennai",
        address: "OMR Road, Kalavakkam, Chennai - 603110",
        mode: "Hybrid (Bangalore Campus + Online)",
        totalFee: 22000,
        paidAmount: 11000
      }
    ];

    const newlyAdded = [];
    for (const cand of incomingCandidates) {
      const alreadyExists = storage.findOne("students", { email: cand.email });
      if (!alreadyExists) {
        const allStudents = storage.find("students");
        const nextNum = allStudents.length + 1;
        const newStu = storage.create("students", {
          id: `ARIT-2026-STU${nextNum < 10 ? "0" + nextNum : nextNum}`,
          name: cand.name,
          email: cand.email,
          phone: cand.phone,
          address: cand.address,
          course: cand.course,
          registrationDate: new Date().toISOString().split("T")[0],
          internshipStatus: "Active",
          duration: "6 Months",
          attendance: 100,
          progress: 5,
          feeStatus: cand.paidAmount >= cand.totalFee ? "Paid" : "Partially Paid",
          totalFee: cand.totalFee,
          paidAmount: cand.paidAmount,
          pendingAmount: Math.max(0, cand.totalFee - cand.paidAmount),
          tasksCompleted: 1,
          totalTasks: 40,
          mentor: "Rajesh K. Sharma",
          college: cand.college,
          certificateId: null,
          certificateIssued: false,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
          mode: cand.mode
        });

        storage.create("internships", {
          id: `INT-APP-${100 + nextNum}`,
          studentId: newStu.id,
          studentName: newStu.name,
          course: newStu.course,
          startDate: new Date().toISOString().split("T")[0],
          endDate: "2027-05-30",
          mentor: newStu.mentor,
          status: "Ongoing",
          college: newStu.college,
          appliedDate: newStu.registrationDate,
          evaluationGrade: "In Progress",
          notes: "Automatically synced from AR IT Internship Registration portal."
        });

        newlyAdded.push(newStu);
      }
    }

    return res.status(200).json({
      success: true,
      message: newlyAdded.length > 0 
        ? `Successfully synced ${newlyAdded.length} new student registration(s).`
        : "Database is already up to date with website registrations.",
      count: newlyAdded.length,
      data: newlyAdded
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to sync website registrations.",
      error: error.message
    });
  }
};
