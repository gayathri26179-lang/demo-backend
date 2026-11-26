const express = require("express");
const router = express.Router();
const progressController = require("../controller/progressController");
const authMiddleware = require("../Middleware/authmiddleware");

router.use(authMiddleware);

router.get("/", progressController.getProgress);
router.patch("/:studentId", progressController.updateProgress);

module.exports = router;
