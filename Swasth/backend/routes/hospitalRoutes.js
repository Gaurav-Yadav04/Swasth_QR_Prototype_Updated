import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Hospital from "../models/Hospital.js";
import verifyHospitalAdmin from "../middleware/verifyHospitalAdmin.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const hospital = await Hospital.findOne({
      "admin.email": email.toLowerCase(),
    });

    if (!hospital) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      hospital.admin.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: hospital._id,
        role: "hospital",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      message: "Hospital login successful",

      token,

      hospital: {
        _id: hospital._id,
        hospitalCode: hospital.hospitalCode,
        name: hospital.name,
        city: hospital.city,
        phone: hospital.phone,
        address: hospital.address,
        departments: hospital.departments,
        email: hospital.admin.email,
        adminName: hospital.admin.name,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.post("/register", async (req, res) => {
  try {
    const {
      hospitalCode,
      name,
      admin,
      address,
      city,
      phone,
      departments,
    } = req.body;

    if (
      !hospitalCode ||
      !name ||
      !admin?.name ||
      !admin?.email ||
      !admin?.password
    ) {
      return res.status(400).json({
        message: "Hospital name, code, admin name, email and password are required",
      });
    }

    const existingHospital = await Hospital.findOne({
      $or: [
        { hospitalCode },
        { "admin.email": admin.email.toLowerCase() },
      ],
    });

    if (existingHospital) {
      return res.status(400).json({
        message: "Hospital code or email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(admin.password, 10);

    const hospital = new Hospital({
      hospitalCode,
      name,

      admin: {
        name: admin.name,
        email: admin.email.toLowerCase(),
        password: hashedPassword,
      },

      address: address || {},

      city: city || address?.city || "",

      phone: phone || "",

      departments: departments || [],
    });

    await hospital.save();

    res.status(201).json({
      success: true,
      message: "Hospital registered successfully",
      hospital: {
        _id: hospital._id,
        hospitalCode: hospital.hospitalCode,
        name: hospital.name,
        email: hospital.admin.email,
        adminName: hospital.admin.name,
        city: hospital.city,
        phone: hospital.phone,
        address: hospital.address,
        departments: hospital.departments,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.get("/profile", verifyHospitalAdmin, async (req, res) => {
  try {
    res.json({
      _id: req.hospital._id,
      hospitalCode: req.hospital.hospitalCode,
      name: req.hospital.name,
      city: req.hospital.city,
      phone: req.hospital.phone,
      address: req.hospital.address,
      departments: req.hospital.departments,
      email: req.hospital.admin.email,
      adminName: req.hospital.admin.name,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
/*
====================================================
PUBLIC HOSPITALS
GET /api/hospitals/public
NO AUTH REQUIRED
====================================================
*/

router.get("/public", async (req, res) => {
  try {
    const hospitals = await Hospital.find({
      active: { $ne: false },
    }).select(
      "name city state district address pincode departments"
    );

    res.json({
      success: true,
      hospitals,
    });
  } catch (error) {
    console.error("Public hospitals error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch hospitals",
    });
  }
});


export default router;