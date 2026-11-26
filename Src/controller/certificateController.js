const storage = require("../services/storage");

// 1. GET ALL CERTIFICATES
exports.getAllCertificates = async (req, res) => {
  try {
    const { search } = req.query;
    let certificates = storage.find("certificates");

    if (search) {
      const q = search.toLowerCase();
      certificates = certificates.filter(c =>
        (c.studentName && c.studentName.toLowerCase().includes(q)) ||
        (c.id && c.id.toLowerCase().includes(q)) ||
        (c.verificationCode && c.verificationCode.toLowerCase().includes(q)) ||
        (c.courseName && c.courseName.toLowerCase().includes(q))
      );
    }

    return res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch certificates.",
      error: error.message
    });
  }
};

// 2. GET CERTIFICATE BY ID
exports.getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;
    const cert = storage.findById("certificates", id);

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: `Certificate "${id}" not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: cert
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch certificate details.",
      error: error.message
    });
  }
};

// 3. PUBLIC VERIFY CERTIFICATE BY VERIFICATION CODE
exports.verifyCertificate = async (req, res) => {
  try {
    const { code } = req.params;
    const normalizedCode = code.trim().toUpperCase();

    const cert = storage.findOne("certificates", item =>
      (item.verificationCode && item.verificationCode.toUpperCase() === normalizedCode) ||
      (item.id && item.id.toUpperCase() === normalizedCode)
    );

    if (!cert) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: `No authentic certificate found matching code "${code}".`
      });
    }

    return res.status(200).json({
      success: true,
      verified: true,
      message: "Certificate is authentic and officially issued by AR IT COMPANY.",
      data: cert
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Verification failed.",
      error: error.message
    });
  }
};

// 4. ISSUE / GENERATE CERTIFICATE
exports.issueCertificate = async (req, res) => {
  try {
    const { studentId, theme, grade, skills, authorizedSignatory, technicalLead } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required to issue a certificate."
      });
    }

    const student = storage.findById("students", studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with ID "${studentId}" not found.`
      });
    }

    const all = storage.find("certificates");
    const nextCode = (all.length + 101).toString().padStart(4, "0");
    const id = `ARIT-CERT-2026-${nextCode}`;
    const verificationCode = `ARIT-VERIFY-${nextCode}`;

    const newCert = storage.create("certificates", {
      id,
      studentId: student.id,
      studentName: student.name,
      courseName: student.course,
      duration: `${student.duration || "6 Months"} (Cohort 2026)`,
      issueDate: new Date().toISOString().split("T")[0],
      theme: theme || "navy",
      grade: grade || (student.attendance >= 90 ? "A+ (Distinction)" : "A (Honors)"),
      authorizedSignatory: authorizedSignatory || "Dr. Maya Raman (Managing Director)",
      technicalLead: technicalLead || `${student.mentor || "Rajesh K. Sharma"} (Technical Lead)`,
      company: "AR IT COMPANY",
      verificationCode,
      skills: skills || `${student.course} Architecture, Production Deployment, Agile Lifecycle`
    });

    // Update student status
    storage.findByIdAndUpdate("students", studentId, {
      certificateId: newCert.id,
      certificateIssued: true,
      internshipStatus: "Completed"
    });

    // Add notification
    storage.create("notifications", {
      id: `NOTIF-${Date.now().toString().slice(-4)}`,
      type: "internship",
      title: "Certificate Issued",
      message: `Certificate ${newCert.id} officially stamped for ${student.name}.`,
      timestamp: "Just now",
      unread: true,
      link: "/certificates"
    });

    return res.status(201).json({
      success: true,
      message: `Certificate ${newCert.id} issued successfully.`,
      data: newCert
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to issue certificate.",
      error: error.message
    });
  }
};

// 5. DELETE CERTIFICATE
exports.deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const cert = storage.findById("certificates", id);

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: `Certificate "${id}" not found.`
      });
    }

    storage.findByIdAndDelete("certificates", id);
    if (cert.studentId) {
      storage.findByIdAndUpdate("students", cert.studentId, {
        certificateId: null,
        certificateIssued: false
      });
    }

    return res.status(200).json({
      success: true,
      message: `Certificate "${id}" revoked and deleted successfully.`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete certificate.",
      error: error.message
    });
  }
};
