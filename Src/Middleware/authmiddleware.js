const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Bearer token required in Authorization header."
      });
    }

    const token = authHeader.split(" ")[1];

    // Permit development / demo tokens
    if (token === "demo-jwt-token" || token.startsWith("demo_jwt_")) {
      req.user = {
        id: "ADM-0001",
        email: "admin@aritcompany.com",
        role: "admin",
        name: "Dr. Maya Raman"
      };
      return next();
    }

    const secret = process.env.JWT_SECRET || "arit_company_secure_jwt_secret_key_2026";
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
      error: error.message
    });
  }
};

module.exports = authMiddleware;
