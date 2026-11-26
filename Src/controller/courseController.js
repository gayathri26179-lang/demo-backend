const storage = require("../services/storage");

// 1. GET ALL COURSES
exports.getAllCourses = async (req, res) => {
  try {
    const courses = storage.find("courses");
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses.",
      error: error.message
    });
  }
};

// 2. GET COURSE BY ID
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = storage.findById("courses", id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: `Course with ID "${id}" not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch course details.",
      error: error.message
    });
  }
};

// 3. CREATE COURSE
exports.createCourse = async (req, res) => {
  try {
    const { name, category, duration, fee, status, modulesCount, description, image } = req.body;

    if (!name || fee === undefined) {
      return res.status(400).json({
        success: false,
        message: "Course name and fee are required."
      });
    }

    const allCourses = storage.find("courses");
    const nextNumber = allCourses.length + 1;
    const id = `CRS-${nextNumber < 10 ? "0" + nextNumber : nextNumber}`;

    const newCourse = storage.create("courses", {
      id,
      name,
      category: category || "Full Stack",
      duration: duration || "6 Months",
      fee: Number(fee),
      status: status || "Active",
      enrolledCount: 0,
      modulesCount: Number(modulesCount) || 20,
      image: image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
      description: description || ""
    });

    return res.status(201).json({
      success: true,
      message: `Course "${name}" created successfully.`,
      data: newCourse
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create course.",
      error: error.message
    });
  }
};

// 4. UPDATE COURSE
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = storage.findById("courses", id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Course with ID "${id}" not found.`
      });
    }

    const updated = storage.findByIdAndUpdate("courses", id, req.body);

    return res.status(200).json({
      success: true,
      message: "Course updated successfully.",
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update course.",
      error: error.message
    });
  }
};

// 5. DELETE COURSE
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = storage.findById("courses", id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Course with ID "${id}" not found.`
      });
    }

    storage.findByIdAndDelete("courses", id);

    return res.status(200).json({
      success: true,
      message: `Course "${existing.name}" deleted successfully.`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete course.",
      error: error.message
    });
  }
};
