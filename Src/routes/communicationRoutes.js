const express = require("express");
const router = express.Router();
const communicationController = require("../controller/communicationController");
const authMiddleware = require("../Middleware/authmiddleware");

router.use(authMiddleware);

router.get("/", communicationController.getAllCommunications);
router.post("/", communicationController.sendAnnouncement);
router.delete("/:id", communicationController.deleteCommunication);

module.exports = router;
