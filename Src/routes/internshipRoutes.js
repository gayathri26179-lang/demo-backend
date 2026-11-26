const express = require("express");
const router = express.Router();
const internshipController = require("../controller/internshipController");
const authMiddleware = require("../Middleware/authmiddleware");

router.use(authMiddleware);

router.get("/", internshipController.getAllInternships);
router.post("/", internshipController.createInternship);
router.get("/:id", internshipController.getInternshipById);
router.patch("/:id/status", internshipController.updateStatus);
router.patch("/:id/assign-mentor", internshipController.assignMentor);
router.delete("/:id", internshipController.deleteInternship);

module.exports = router;
