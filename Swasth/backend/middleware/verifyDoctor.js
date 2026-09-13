
import jwt from "jsonwebtoken";
import Doctor from "../models/Doctor.js";

const verifyDoctor = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("========== VERIFY DOCTOR ==========");
    console.log("Authorization Header:", authHeader ? "Present" : "Missing");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token || token === "undefined" || token === "null") {
      return res.status(401).json({
        success: false,
        message: "Doctor token missing",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env");

      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (jwtError) {
      console.error(
        "JWT VERIFY ERROR:",
        jwtError.message
      );

      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    console.log("Decoded Doctor ID:", decoded.id);

    const doctor = await Doctor.findById(decoded.id);

    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: "Doctor not found",
      });
    }

    req.doctor = doctor;

    next();
  } catch (error) {
    console.error(
      "VERIFY DOCTOR ERROR:",
      error
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default verifyDoctor;

