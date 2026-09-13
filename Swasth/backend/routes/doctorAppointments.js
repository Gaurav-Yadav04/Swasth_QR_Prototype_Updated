import express from "express";
import Appointment from "../models/Appointment.js";
import verifyDoctor from "../middleware/verifyDoctor.js";

const router = express.Router();


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
      const appointments = await Appointment.find({
        doctorId: req.doctor._id,

        "patientSnapshot.status": {
          $ne: "cancelled",
        },
      })
        .populate(
          "patientId",
          "name fullName phone mobile"
        )
        .populate(
          "hospitalId",
          "name city address"
        )
        .sort({
          "patientSnapshot.tokenNumber": 1,
        });

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
DOCTOR CALL NEXT PATIENT
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

          doctorId: req.doctor._id,
        });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found",
        });
      }

      /*
      Complete previous in-progress patient
      */

      await Appointment.updateMany(
        {
          doctorId: req.doctor._id,

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
      Make selected patient in-progress
      */

      appointment.patientSnapshot.status =
        "in-progress";

      await appointment.save();

      return res.json({
        success: true,

        message: "Patient called successfully",

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
DOCTOR COMPLETE PATIENT
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

          doctorId: req.doctor._id,
        });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found",
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


export default router;