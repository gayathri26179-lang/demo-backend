const express = require("express");
const router = express.Router();
const reportController = require("../controller/reportController");
const authMiddleware = require("../Middleware/authmiddleware");

router.use(authMiddleware);

router.get("/", reportController.getReports);

module.exports = router;
