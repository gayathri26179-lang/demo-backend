const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const { notFoundHandler, errorHandler } = require("./Middleware/errorMiddleware");

// Route Handlers
const authRoutes = require("./routes/authroutes");
const studentRoutes = require("./routes/studentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const internshipRoutes = require("./routes/internshipRoutes");
const activityRoutes = require("./routes/activityRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const progressRoutes = require("./routes/progressRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const communicationRoutes = require("./routes/communicationRoutes");
const reportRoutes = require("./routes/reportRoutes");

// Initialize Database connection (Dual-mode: MongoDB Atlas / Local + JSON Storage Engine)
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Client-Source"]
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request Logger (Development mode)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health & Root Status
app.get("/", (req, res) => {
  res.status(200).json({
    status: "online",
    project: "AR IT COMPANY - Full Stack CRM & Internship Management Backend Engine",
    version: "2.0.0",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount All Core REST API Modules
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/daily-activities", activityRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/communications", communicationRoutes);
app.use("/api/reports", reportRoutes);

// Fallback for non-existent routes
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 AR IT Backend Server active at http://localhost:${PORT}`);
  console.log(`📡 Ready to receive requests from Frontend CRM portal`);
  console.log(`====================================================`);
});

module.exports = { app, server };
