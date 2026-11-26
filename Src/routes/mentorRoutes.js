const express = require("express");
const router = express.Router();
const mentorController = require("../controller/mentorController");
const authMiddleware = require("../Middleware/authmiddleware");

// Mentors listing can be accessed to view mentors, full CRUD with auth
router.get("/", mentorController.getAllMentors);
router.get("/:id", mentorController.getMentorById);
router.post("/", authMiddleware, mentorController.createMentor);
router.put("/:id", authMiddleware, mentorController.updateMentor);
router.delete("/:id", authMiddleware, mentorController.deleteMentor);

module.exports = router;
