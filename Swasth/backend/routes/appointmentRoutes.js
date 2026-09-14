
import express from "express";
import jwt from "jsonwebtoken";

import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";
import Patient from "../models/Patient.js";

import verifyPatient from "../middleware/verifyPatient.js";

const router = express.Router();

/*
====================================================
HELPERS
====================================================
*/

const getTodayRange = () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return {
    startOfDay,
    endOfDay,
  };
};

/*
====================================================
HOSPITAL TOKEN VERIFICATION

Used by Hospital Kiosk.
====================================================
*/

const verifyHospitalToken = async (req, res, next) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      console.error("JWT_SECRET is missing in backend .env");

      return res.status(500).json({
        success: false,
        message: "Server JWT configuration is missing",
      });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.error("Hospital token not received");

      return res.status(401).json({
        success: false,
        message: "Hospital authentication required",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      console.error("Invalid Authorization header format");

      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      console.error("Hospital token is empty");

      return res.status(401).json({
        success: false,
        message: "Hospital token missing",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      console.error(
        "HOSPITAL JWT VERIFY ERROR:",
        jwtError.name,
        jwtError.message
      );

      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message:
            "Hospital token has expired. Please login again.",
        });
      }

      if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message:
            "Invalid hospital token. Please login again.",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Hospital authentication failed",
      });
    }

    console.log("Hospital JWT verified successfully");
    console.log("Hospital token payload:", decoded);

    const hospitalId =
      decoded?.hospitalId ||
      decoded?.id ||
      decoded?._id;

    if (!hospitalId) {
      console.error(
        "Hospital ID missing from JWT payload"
      );

      return res.status(401).json({
        success: false,
        message:
          "Hospital ID is missing in hospital token",
      });
    }

    if (
      decoded?.role &&
      decoded.role !== "hospital"
    ) {
      return res.status(403).json({
        success: false,
        message: "Hospital access required",
      });
    }

    const hospital =
      await Hospital.findById(hospitalId);

    if (!hospital) {
      console.error(
        "Hospital not found for JWT:",
        hospitalId
      );

      return res.status(401).json({
        success: false,
        message: "Hospital not found",
      });
    }

    req.hospital = hospital;

    next();
  } catch (error) {
    console.error(
      "Hospital authentication error:",
      error
    );

    return res.status(401).json({
      success: false,
      message: "Hospital authentication failed",
    });
  }
};

/*
====================================================
CREATE APPOINTMENT

POST /api/appointments

PATIENT AUTH REQUIRED
====================================================
*/

router.post(
  "/",
  verifyPatient,
  async (req, res) => {
    try {
      const {
        doctorId,
        hospitalId,
        disease,
      } = req.body;

      if (
        !doctorId ||
        !hospitalId ||
        !disease
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Doctor, hospital and disease are required",
        });
      }

      const doctor =
        await Doctor.findById(doctorId);

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }

      const hospital =
        await Hospital.findById(hospitalId);

      if (!hospital) {
        return res.status(404).json({
          success: false,
          message: "Hospital not found",
        });
      }

      if (
        doctor.hospital &&
        String(doctor.hospital) !==
          String(hospital._id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Doctor does not belong to this hospital",
        });
      }

      if (doctor.active === false) {
        return res.status(400).json({
          success: false,
          message:
            "Doctor is currently unavailable",
        });
      }

      const {
        startOfDay,
        endOfDay,
      } = getTodayRange();

      const lastAppointment =
        await Appointment.findOne({
          doctorId: doctor._id,
          hospitalId: hospital._id,

          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },

          "patientSnapshot.status": {
            $ne: "cancelled",
          },
        }).sort({
          "patientSnapshot.tokenNumber": -1,
        });

      const lastToken =
        Number(
          lastAppointment
            ?.patientSnapshot
            ?.tokenNumber
        ) || 0;

      const tokenNumber =
        lastToken + 1;

      const patientName =
        req.patient.name ||
        req.patient.fullName ||
        "Patient";

      const patientPhone =
        req.patient.phone ||
        req.patient.mobile ||
        "";

      const department =
        doctor.department ||
        doctor.specialization ||
        "General";

      const roomNo =
        doctor.roomNumber ||
        doctor.room ||
        "-";

      const appointment =
        await Appointment.create({
          patientId: req.patient._id,

          doctorId: doctor._id,

          hospitalId: hospital._id,

          patientSnapshot: {
            name: patientName,

            phone: patientPhone,

            department,

            roomNo,

            doctor: doctor.name,

            disease,

            visitDate: new Date(),

            tokenNumber,

            status: "waiting",
          },
        });

      return res.status(201).json({
        success: true,

        message:
          "Appointment booked successfully",

        appointment,
      });
    } catch (error) {
      console.error(
        "Create appointment error:",
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
CREATE APPOINTMENT FROM HOSPITAL KIOSK

POST /api/appointments/kiosk

HOSPITAL AUTH REQUIRED
====================================================
*/

router.post(
  "/kiosk",
  verifyHospitalToken,
  async (req, res) => {
    try {
      const {
        patientId,
        doctorId,
        hospitalId,
        disease,
      } = req.body;

      console.log(
        "Kiosk appointment request:",
        {
          patientId,
          doctorId,
          hospitalId,
          disease,
        }
      );

      if (
        !patientId ||
        !doctorId ||
        !disease
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Patient, doctor and disease are required",
        });
      }

      const hospital = req.hospital;

      if (!hospital) {
        return res.status(401).json({
          success: false,
          message:
            "Hospital authentication failed",
        });
      }

      /*
      ------------------------------------------------
      CHECK HOSPITAL
      ------------------------------------------------
      */

      if (
        hospitalId &&
        String(hospitalId) !==
          String(hospital._id)
      ) {
        console.error(
          "Hospital mismatch:",
          {
            requestHospitalId: hospitalId,
            loggedInHospitalId:
              hospital._id.toString(),
          }
        );

        return res.status(403).json({
          success: false,
          message:
            "Hospital does not match logged-in hospital",
        });
      }

      /*
      ------------------------------------------------
      FIND PATIENT
      ------------------------------------------------
      */

      const patient =
        await Patient.findById(patientId);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }

      /*
      ------------------------------------------------
      FIND DOCTOR
      ------------------------------------------------
      */

      const doctor =
        await Doctor.findById(doctorId);

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }

      /*
      ------------------------------------------------
      CHECK DOCTOR HOSPITAL
      ------------------------------------------------
      */

      if (
        doctor.hospital &&
        String(doctor.hospital) !==
          String(hospital._id)
      ) {
        console.error(
          "Doctor hospital mismatch:",
          {
            doctorHospital:
              doctor.hospital.toString(),
            loggedInHospital:
              hospital._id.toString(),
          }
        );

        return res.status(403).json({
          success: false,
          message:
            "This doctor does not belong to this hospital",
        });
      }

      /*
      ------------------------------------------------
      CHECK DOCTOR STATUS
      ------------------------------------------------
      */

      if (doctor.active === false) {
        return res.status(400).json({
          success: false,
          message:
            "Doctor is currently unavailable",
        });
      }

      /*
      ------------------------------------------------
      TODAY'S QUEUE
      ------------------------------------------------
      */

      const {
        startOfDay,
        endOfDay,
      } = getTodayRange();

      const lastAppointment =
        await Appointment.findOne({
          doctorId: doctor._id,

          hospitalId: hospital._id,

          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },

          "patientSnapshot.status": {
            $ne: "cancelled",
          },
        }).sort({
          "patientSnapshot.tokenNumber": -1,
        });

      const lastToken =
        Number(
          lastAppointment
            ?.patientSnapshot
            ?.tokenNumber
        ) || 0;

      const tokenNumber =
        lastToken + 1;

      /*
      ------------------------------------------------
      PATIENT DETAILS
      ------------------------------------------------
      */

      const patientName =
        patient.name ||
        patient.fullName ||
        "Patient";

      const patientPhone =
        patient.phone ||
        patient.mobile ||
        "";

      /*
      ------------------------------------------------
      DOCTOR DETAILS
      ------------------------------------------------
      */

      const department =
        doctor.department ||
        doctor.specialization ||
        "General";

      const roomNo =
        doctor.roomNumber ||
        doctor.room ||
        "-";

      /*
      ------------------------------------------------
      CREATE APPOINTMENT
      ------------------------------------------------
      */

      const appointment =
        await Appointment.create({
          patientId: patient._id,

          doctorId: doctor._id,

          hospitalId: hospital._id,

          patientSnapshot: {
            name: patientName,

            phone: patientPhone,

            department,

            roomNo,

            doctor: doctor.name,

            disease,

            visitDate: new Date(),

            tokenNumber,

            status: "waiting",
          },
        });

      console.log(
        "Kiosk appointment created successfully:",
        appointment._id.toString()
      );

      return res.status(201).json({
        success: true,

        message:
          "Kiosk appointment created successfully",

        appointment,

        tokenNumber,

        appointmentId:
          appointment._id,
      });
    } catch (error) {
      console.error(
        "================================="
      );

      console.error(
        "KIOSK APPOINTMENT ERROR"
      );

      console.error(
        "Name:",
        error.name
      );

      console.error(
        "Message:",
        error.message
      );

      if (error.errors) {
        console.error(
          "Validation Errors:",
          error.errors
        );
      }

      console.error(
        "================================="
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to create kiosk appointment",
      });
    }
  }
);

/*
====================================================
MY APPOINTMENTS

GET /api/appointments/my

PATIENT AUTH REQUIRED
====================================================
*/

router.get(
  "/my",
  verifyPatient,
  async (req, res) => {
    try {
      const appointments =
        await Appointment.find({
          patientId: req.patient._id,
        })
          .populate(
            "doctorId",
            "name specialization department roomNumber room active availableTime"
          )
          .populate(
            "hospitalId",
            "name city state district address pincode departments"
          )
          .sort({
            createdAt: -1,
          });

      return res.json({
        success: true,
        appointments,
      });
    } catch (error) {
      console.error(
        "Patient appointments error:",
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
SINGLE APPOINTMENT

GET /api/appointments/:id

PATIENT AUTH REQUIRED
====================================================
*/

router.get(
  "/:id",
  verifyPatient,
  async (req, res) => {
    try {
      const appointment =
        await Appointment.findOne({
          _id: req.params.id,

          patientId:
            req.patient._id,
        })
          .populate(
            "doctorId",
            "name specialization department roomNumber room active availableTime"
          )
          .populate(
            "hospitalId",
            "name city state district address pincode departments"
          );

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message:
            "Appointment not found",
        });
      }

      return res.json({
        success: true,
        appointment,
      });
    } catch (error) {
      console.error(
        "Single appointment error:",
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
PATIENT LIVE QUEUE

GET /api/appointments/:id/queue

PATIENT AUTH REQUIRED
====================================================
*/

router.get(
  "/:id/queue",
  verifyPatient,
  async (req, res) => {
    try {
      const appointment =
        await Appointment.findOne({
          _id: req.params.id,

          patientId:
            req.patient._id,
        });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message:
            "Appointment not found",
        });
      }

      const {
        startOfDay,
        endOfDay,
      } = getTodayRange();

      const queue =
        await Appointment.find({
          doctorId:
            appointment.doctorId,

          hospitalId:
            appointment.hospitalId,

          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },

          "patientSnapshot.status": {
            $ne: "cancelled",
          },
        })
          .populate(
            "doctorId",
            "name specialization department roomNumber room active availableTime"
          )
          .sort({
            "patientSnapshot.tokenNumber": 1,
          });

      const activeQueue =
        queue.filter(
          (item) =>
            item.patientSnapshot.status !==
            "completed"
        );

      const current =
        queue.find(
          (item) =>
            item.patientSnapshot.status ===
            "in-progress"
        );

      const currentToken =
        current?.patientSnapshot
          ?.tokenNumber || 0;

      const myToken =
        appointment.patientSnapshot
          .tokenNumber;

      const ahead =
        activeQueue.filter(
          (item) =>
            Number(
              item.patientSnapshot
                .tokenNumber
            ) < Number(myToken)
        ).length;

      return res.json({
        success: true,

        appointment,

        currentToken,

        myToken,

        ahead,

        queue: activeQueue,
      });
    } catch (error) {
      console.error(
        "Patient queue error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

export default router;
