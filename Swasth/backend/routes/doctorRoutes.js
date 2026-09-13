
import express from "express";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import verifyDoctor from "../middleware/verifyDoctor.js";
import verifyHospitalAdmin from "../middleware/verifyHospitalAdmin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

/*
====================================================
ADD DOCTOR
POST /api/doctors/add
====================================================
*/

router.post(
  "/add",
  verifyHospitalAdmin,
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        specialization,
        department,
        roomNumber,
        phone,
        active,
        availableDays,
        availableTime,
      } = req.body;

      if (
        !name ||
        !email ||
        !password ||
        !specialization ||
        !department
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Name, email, password, specialization and department are required",
        });
      }

      const existingDoctor =
        await Doctor.findOne({
          email: email.toLowerCase(),
        });

      if (existingDoctor) {
        return res.status(400).json({
          success: false,
          message: "Doctor email already exists",
        });
      }

      const doctor = new Doctor({
        hospital: req.hospital._id,

        hospitalCode:
          req.hospital.hospitalCode,

        name,

        email: email.toLowerCase(),

        password,

        specialization,

        department,

        roomNumber: roomNumber || "",

        phone: phone || "",

        active:
          active === undefined
            ? true
            : active,

        availableDays:
          availableDays || [],

        availableTime:
          availableTime || {},
      });

      await doctor.save();

      const doctorResponse =
        doctor.toObject();

      delete doctorResponse.password;

      return res.status(201).json({
        success: true,
        message: "Doctor added successfully",
        data: doctorResponse,
      });
    } catch (error) {
      console.error(
        "Add doctor error:",
        error
      );

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/*
====================================================
DOCTOR LOGIN
POST /api/doctors/login
====================================================
*/

router.post(
  "/login",
  async (req, res) => {
    try {
      const { email, password } =
        req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message:
            "Email and password are required",
        });
      }

      if (!process.env.JWT_SECRET) {
        console.error(
          "JWT_SECRET missing from .env"
        );

        return res.status(500).json({
          success: false,
          message:
            "JWT_SECRET is not configured",
        });
      }

      const doctor =
        await Doctor.findOne({
          email: email.toLowerCase(),
        });

      if (!doctor) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password",
        });
      }

      const isMatch =
        await bcrypt.compare(
          password,
          doctor.password
        );

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password",
        });
      }

      const token = jwt.sign(
        {
          id: doctor._id.toString(),
          role: "doctor",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      console.log(
        "Doctor login successful:",
        doctor._id.toString()
      );

      return res.json({
        success: true,
        message: "Login successful",

        token,

        doctor: {
          _id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          specialization:
            doctor.specialization,
          department:
            doctor.department,
          hospitalCode:
            doctor.hospitalCode,
          roomNumber:
            doctor.roomNumber,
          phone: doctor.phone,
          active: doctor.active,
          availableTime:
            doctor.availableTime,
        },
      });
    } catch (error) {
      console.error(
        "Doctor login error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/*
====================================================
PUBLIC DOCTORS
GET /api/doctors/public
====================================================
*/

router.get(
  "/public",
  async (req, res) => {
    try {
      const {
        specialization,
        hospitalCode,
      } = req.query;

      const query = {
        active: true,
      };

      if (hospitalCode) {
        query.hospitalCode =
          hospitalCode;
      }

      if (specialization) {
        query.specialization = {
          $regex: specialization,
          $options: "i",
        };
      }

      const doctors =
        await Doctor.find(query)
          .select(
            "name specialization department roomNumber room active availableTime hospital hospitalCode"
          )
          .populate(
            "hospital",
            "name hospitalCode"
          )
          .lean();

      return res.json({
        success: true,
        doctors,
      });
    } catch (error) {
      console.error(
        "Public doctors error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch doctors",
      });
    }
  }
);

/*
====================================================
GET ALL DOCTORS
GET /api/doctors
====================================================
*/

router.get(
  "/",
  verifyHospitalAdmin,
  async (req, res) => {
    try {
      const doctors =
        await Doctor.find({
          hospital:
            req.hospital._id,
        }).select("-password");

      return res.json({
        success: true,
        doctors,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/*
====================================================
UPDATE DOCTOR
PUT /api/doctors/:id
====================================================
*/

router.put(
  "/:id",
  verifyHospitalAdmin,
  async (req, res) => {
    try {
      const doctor =
        await Doctor.findOne({
          _id: req.params.id,
          hospital:
            req.hospital._id,
        });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }

      const allowedFields = [
        "name",
        "email",
        "phone",
        "specialization",
        "department",
        "roomNumber",
        "active",
        "availableDays",
        "availableTime",
      ];

      allowedFields.forEach(
        (field) => {
          if (
            req.body[field] !==
            undefined
          ) {
            doctor[field] =
              req.body[field];
          }
        }
      );

      if (req.body.password) {
        const salt =
          await bcrypt.genSalt(10);

        doctor.password =
          await bcrypt.hash(
            req.body.password,
            salt
          );
      }

      await doctor.save();

      const response =
        doctor.toObject();

      delete response.password;

      return res.json({
        success: true,
        message:
          "Doctor updated successfully",
        data: response,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/*
====================================================
DELETE DOCTOR
DELETE /api/doctors/:id
====================================================
*/

router.delete(
  "/:id",
  verifyHospitalAdmin,
  async (req, res) => {
    try {
      const doctor =
        await Doctor.findOneAndDelete({
          _id: req.params.id,
          hospital:
            req.hospital._id,
        });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }

      return res.json({
        success: true,
        message: "Doctor deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/*
====================================================
DOCTOR APPOINTMENTS
GET /api/doctor/appointments
====================================================
*/

router.get(
  "/appointments",
  verifyDoctor,
  async (req, res) => {
    try {
      console.log(
        "Fetching appointments for doctor:",
        req.doctor._id.toString()
      );

      const appointments =
        await Appointment.find({
          doctorId:
            req.doctor._id,

          "patientSnapshot.status": {
            $ne: "cancelled",
          },
        })
          .populate(
            "patientId",
            "name email phone"
          )
          .populate(
            "hospitalId",
            "name city address"
          )
          .sort({
            "patientSnapshot.tokenNumber":
              1,
          });

      console.log(
        "Appointments found:",
        appointments.length
      );

      return res.json({
        success: true,
        appointments,
      });
    } catch (error) {
      console.error(
        "Doctor appointments error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/*
====================================================
DOCTOR PROFILE
GET /api/doctors/profile
====================================================
*/

router.get(
  "/profile",
  verifyDoctor,
  async (req, res) => {
    try {
      return res.json({
        success: true,
        doctor: req.doctor,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/*
====================================================
CALL NEXT PATIENT
PATCH /api/doctor/appointments/:id/call
====================================================
*/

router.patch(
  "/appointments/:id/call",
  verifyDoctor,
  async (req, res) => {
    try {
      const appointment =
        await Appointment.findOne({
          _id: req.params.id,
          doctorId:
            req.doctor._id,
        });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message:
            "Appointment not found",
        });
      }

      /*
      Complete previous in-progress
      */

      await Appointment.updateMany(
        {
          doctorId:
            req.doctor._id,

          "patientSnapshot.status":
            "in-progress",
        },
        {
          $set: {
            "patientSnapshot.status":
              "completed",
          },
        }
      );

      /*
      Make selected patient current
      */

      appointment.patientSnapshot.status =
        "in-progress";

      await appointment.save();

      return res.json({
        success: true,
        message:
          "Patient called successfully",
        appointment,
      });
    } catch (error) {
      console.error(
        "Call patient error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/*
====================================================
COMPLETE PATIENT
PATCH /api/doctor/appointments/:id/complete
====================================================
*/

router.patch(
  "/appointments/:id/complete",
  verifyDoctor,
  async (req, res) => {
    try {
      const appointment =
        await Appointment.findOne({
          _id: req.params.id,
          doctorId:
            req.doctor._id,
        });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message:
            "Appointment not found",
        });
      }

      appointment.patientSnapshot.status =
        "completed";

      await appointment.save();

      return res.json({
        success: true,
        message:
          "Consultation completed",
        appointment,
      });
    } catch (error) {
      console.error(
        "Complete appointment error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/*
====================================================
DOCTOR OPD STATUS
PATCH /api/doctors/status
====================================================
*/

router.patch(
  "/status",
  verifyDoctor,
  async (req, res) => {
    try {
      const { active } = req.body;

      req.doctor.active = active;

      await req.doctor.save();

      return res.json({
        success: true,
        active: req.doctor.active,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

export default router;

