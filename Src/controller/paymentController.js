const storage = require("../services/storage");

// 1. GET ALL PAYMENTS
exports.getAllPayments = async (req, res) => {
  try {
    const { studentId, status } = req.query;
    let payments = storage.find("payments");

    if (studentId) {
      payments = payments.filter(p => p.studentId === studentId);
    }
    if (status && status !== "All") {
      payments = payments.filter(p => p.paymentStatus && p.paymentStatus.toLowerCase() === status.toLowerCase());
    }

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments.",
      error: error.message
    });
  }
};

// 2. GET PAYMENT BY ID
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = storage.findById("payments", id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: `Payment transaction "${id}" not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment details.",
      error: error.message
    });
  }
};

// 3. RECORD PAYMENT
exports.recordPayment = async (req, res) => {
  try {
    const { studentId, studentName, course, amountPaid, method, receiptNo, paymentDate } = req.body;

    if (!studentId || amountPaid === undefined) {
      return res.status(400).json({
        success: false,
        message: "studentId and amountPaid are required."
      });
    }

    const student = storage.findById("students", studentId);
    const all = storage.find("payments");
    const nextNum = all.length + 1;
    const id = `TXN-ARIT-${8900 + nextNum}`;
    const amount = Number(amountPaid);

    const targetCourse = course || (student ? student.course : "Full Stack Development");
    const targetStudentName = studentName || (student ? student.name : "Student");
    const courseFee = student ? student.totalFee : (amountPaid * 1.2);

    let updatedPending = 0;
    if (student) {
      const newPaidTotal = (student.paidAmount || 0) + amount;
      updatedPending = Math.max(0, student.totalFee - newPaidTotal);
      const newFeeStatus = updatedPending === 0 ? "Paid" : newPaidTotal > 0 ? "Partially Paid" : "Pending";

      storage.findByIdAndUpdate("students", studentId, {
        paidAmount: newPaidTotal,
        pendingAmount: updatedPending,
        feeStatus: newFeeStatus
      });
    }

    const newPayment = storage.create("payments", {
      id,
      studentId,
      studentName: targetStudentName,
      course: targetCourse,
      courseFee,
      amountPaid: amount,
      pendingAmount: updatedPending,
      paymentDate: paymentDate || new Date().toISOString().split("T")[0],
      paymentStatus: updatedPending === 0 ? "Paid" : "Partially Paid",
      method: method || "Online Transfer",
      receiptNo: receiptNo || `REC-2026-${100 + nextNum}`
    });

    // Create notification
    storage.create("notifications", {
      id: `NOTIF-${Date.now().toString().slice(-4)}`,
      type: "payment",
      title: "Payment Received",
      message: `Payment of ₹${amount.toLocaleString("en-IN")} received from ${targetStudentName}.`,
      timestamp: "Just now",
      unread: true,
      link: "/payments"
    });

    return res.status(201).json({
      success: true,
      message: `Payment of ₹${amount.toLocaleString("en-IN")} recorded successfully.`,
      data: newPayment
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to record payment.",
      error: error.message
    });
  }
};

// 4. FINANCIAL SUMMARY
exports.getPaymentSummary = async (req, res) => {
  try {
    const payments = storage.find("payments");
    const students = storage.find("students");

    const totalRevenueCollected = payments.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
    const totalPendingDues = students.reduce((sum, s) => sum + (Number(s.pendingAmount) || 0), 0);
    const totalCourseFees = students.reduce((sum, s) => sum + (Number(s.totalFee) || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        totalRevenueCollected,
        totalPendingDues,
        totalCourseFees,
        totalTransactions: payments.length
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate payment summary.",
      error: error.message
    });
  }
};
