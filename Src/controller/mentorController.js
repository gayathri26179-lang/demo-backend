const storage = require("../services/storage");

// 1. GET ALL MENTORS
exports.getAllMentors = async (req, res) => {
  try {
    const mentors = storage.find("mentors");
    return res.status(200).json({
      success: true,
      count: mentors.length,
      data: mentors
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch mentors.",
      error: error.message
    });
  }
};

// 2. GET MENTOR BY ID
exports.getMentorById = async (req, res) => {
  try {
    const { id } = req.params;
    const mentor = storage.findById("mentors", id);

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: `Mentor with ID "${id}" not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: mentor
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch mentor details.",
      error: error.message
    });
  }
};

// 3. CREATE MENTOR
exports.createMentor = async (req, res) => {
  try {
    const { name, email, specialization, assignedCourse, phone, experience, avatar } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Mentor name and corporate email are required."
      });
    }

    const all = storage.find("mentors");
    const nextNum = all.length + 1;
    const id = `MTR-${nextNum < 10 ? "0" + nextNum : nextNum}`;

    const newMentor = storage.create("mentors", {
      id,
      name,
      email: email.toLowerCase().trim(),
      specialization: specialization || "Software Engineering",
      assignedCourse: assignedCourse || "Full Stack Development",
      activeStudentsCount: 0,
      phone: phone || "+91 98450 00000",
      avatar: avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      experience: experience || "5+ Years"
    });

    return res.status(201).json({
      success: true,
      message: `Mentor "${name}" added successfully.`,
      data: newMentor
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create mentor.",
      error: error.message
    });
  }
};

// 4. UPDATE MENTOR
exports.updateMentor = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = storage.findById("mentors", id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Mentor with ID "${id}" not found.`
      });
    }

    const updated = storage.findByIdAndUpdate("mentors", id, req.body);

    return res.status(200).json({
      success: true,
      message: "Mentor profile updated successfully.",
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update mentor.",
      error: error.message
    });
  }
};

// 5. DELETE MENTOR
exports.deleteMentor = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = storage.findById("mentors", id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Mentor with ID "${id}" not found.`
      });
    }

    storage.findByIdAndDelete("mentors", id);

    return res.status(200).json({
      success: true,
      message: `Mentor "${existing.name}" deleted successfully.`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete mentor.",
      error: error.message
    });
  }
};
