const express = require("express");
const router = express.Router();
const activityController = require("../controller/activityController");
const authMiddleware = require("../Middleware/authmiddleware");

router.use(authMiddleware);

router.get("/", activityController.getAllActivities);
router.post("/", activityController.createActivity);
router.get("/:id", activityController.getActivityById);
router.patch("/:id/feedback", activityController.addMentorFeedback);
router.delete("/:id", activityController.deleteActivity);

module.exports = router;
