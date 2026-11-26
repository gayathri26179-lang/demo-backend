const express = require("express");
const router = express.Router();
const certificateController = require("../controller/certificateController");
const authMiddleware = require("../Middleware/authmiddleware");

// Public verification
router.get("/verify/:code", certificateController.verifyCertificate);

// Protected certificate management
router.get("/", authMiddleware, certificateController.getAllCertificates);
router.post("/", authMiddleware, certificateController.issueCertificate);
router.get("/:id", authMiddleware, certificateController.getCertificateById);
router.delete("/:id", authMiddleware, certificateController.deleteCertificate);

module.exports = router;
