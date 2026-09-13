
import jwt from "jsonwebtoken";
import Patient from "../models/Patient.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "swasth_qr_secret_key";

const verifyPatient = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader
      .substring(7)
      .trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    /*
    ================================================
    VERIFY JWT
    ================================================
    */

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        JWT_SECRET
      );
    } catch (jwtError) {
      console.error(
        "JWT VERIFY ERROR:",
        jwtError.name,
        jwtError.message
      );

      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    console.log(
      "DECODED PATIENT TOKEN:",
      decoded
    );

    /*
    ================================================
    CHECK ROLE
    ================================================
    */

    if (decoded.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Patient access required",
      });
    }

    /*
    ================================================
    IMPORTANT:
    Token contains patientId
    ================================================
    */

    if (!decoded.patientId) {
      return res.status(401).json({
        success: false,
        message: "Invalid patient token",
      });
    }

    /*
    ================================================
    FIND PATIENT
    ================================================
    */

    const patient = await Patient.findById(
      decoded.patientId
    );

    if (!patient) {
      return res.status(401).json({
        success: false,
        message: "Patient not found",
      });
    }

    /*
    ================================================
    ATTACH PATIENT
    ================================================
    */

    req.patient = patient;

    next();

  } catch (error) {
    console.error(
      "VERIFY PATIENT ERROR:",
      error
    );

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

export default verifyPatient;
