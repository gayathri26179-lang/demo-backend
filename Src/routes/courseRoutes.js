const express = require("express");
const router = express.Router();
const courseController = require("../controller/courseController");
const authMiddleware = require("../Middleware/authmiddleware");

// Courses can be viewed without auth, but managed with auth
router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourseById);
router.post("/", authMiddleware, courseController.createCourse);
router.put("/:id", authMiddleware, courseController.updateCourse);
router.delete("/:id", authMiddleware, courseController.deleteCourse);

module.exports = router;
