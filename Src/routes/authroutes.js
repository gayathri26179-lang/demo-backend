const express = require("express");
const router = express.Router();
const authController = require("../controller/authcontroller");
const authMiddleware = require("../Middleware/authmiddleware");

// Specific CRM Auth Routes
router.post("/admin/register", authController.registerAdmin);
router.post("/admin/login", authController.adminLogin);
router.post("/admin/logout", authController.logout);
router.post("/mentor/login", authController.mentorLogin);
router.get("/verify", authMiddleware, authController.verifyToken);

// General aliases
router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;
