const express = require("express");
const router = express.Router();
const paymentController = require("../controller/paymentController");
const authMiddleware = require("../Middleware/authmiddleware");

router.use(authMiddleware);

router.get("/", paymentController.getAllPayments);
router.post("/", paymentController.recordPayment);
router.get("/summary", paymentController.getPaymentSummary);
router.get("/:id", paymentController.getPaymentById);

module.exports = router;
