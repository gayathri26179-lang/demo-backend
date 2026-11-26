const express = require("express");
const router = express.Router();
const attendanceController = require("../controller/attendanceController");
const authMiddleware = require("../Middleware/authmiddleware");

router.use(authMiddleware);

router.get("/", attendanceController.getAttendance);
router.post("/", attendanceController.markAttendance);
router.get("/summary", attendanceController.getAttendanceSummary);

module.exports = router;
