import jwt from "jsonwebtoken";
import Hospital from "../models/Hospital.js";

const verifyHospitalAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Hospital authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "hospital") {
      return res.status(403).json({
        message: "Hospital access required",
      });
    }

    const hospital = await Hospital.findById(
      decoded.id
    );

    if (!hospital) {
      return res.status(401).json({
        message: "Hospital not found",
      });
    }

    req.hospital = hospital;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired hospital token",
    });
  }
};

export default verifyHospitalAdmin;