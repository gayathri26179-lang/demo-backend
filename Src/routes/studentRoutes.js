const express = require("express");
const router = express.Router();
const studentController = require("../controller/studentController");
const authMiddleware = require("../Middleware/authmiddleware");

// All student routes are protected
router.use(authMiddleware);

router.get("/", studentController.getAllStudents);
router.post("/", studentController.createStudent);
router.post("/sync-website-registrations", studentController.syncWebsiteRegistrations);
router.get("/:id", studentController.getStudentById);
router.put("/:id", studentController.updateStudent);
router.delete("/:id", studentController.deleteStudent);

module.exports = router;
