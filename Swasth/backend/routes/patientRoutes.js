
import express from "express";
import QRCode from "qrcode";
import jwt from "jsonwebtoken";

import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "swasth_qr_secret_key";


/*
====================================================
CREATE PATIENT TOKEN
====================================================
*/

function createPatientToken(patient) {
  return jwt.sign(
    {
      patientId:
        patient._id.toString(),

      role: "patient",
    },

    JWT_SECRET,

    {
      expiresIn: "7d",
    }
  );
}


/*
====================================================
PATIENT REGISTER
POST /api/patients/register
====================================================
*/

router.post(
  "/register",
  async (req, res) => {
    try {
      const {
        name,
        fatherName,
        age,
        adhar_no,
        gender,
        phone,
        address,
      } = req.body;

      if (
        !name ||
        !fatherName ||
        !age ||
        !adhar_no ||
        !gender ||
        !phone ||
        !address
      ) {
        return res.status(400).json({
          error:
            "Please fill all registration fields",
        });
      }

      const existing =
        await Patient.findOne({
          adhar_no,
        });

      if (existing) {
        return res.status(400).json({
          error:
            "Patient already exists with this Aadhaar number",
        });
      }

      const newPatient =
        new Patient({
          name,
          fatherName,
          age,
          adhar_no,
          gender,
          phone,
          address,
        });

      await newPatient.save();

      const qrCode =
        await QRCode.toDataURL(
          newPatient._id.toString()
        );

      newPatient.qrCode =
        qrCode;

      await newPatient.save();

      const token =
        createPatientToken(
          newPatient
        );

      res.status(201).json({
        message:
          "Patient registered successfully",

        token,

        patient:
          newPatient,
      });

    } catch (err) {
      console.error(err);

      res.status(500).json({
        error:
          err.message,
      });
    }
  }
);


/*
====================================================
PATIENT LOGIN
POST /api/patients/login
====================================================
*/

router.post(
  "/login",
  async (req, res) => {
    try {
      const {
        name,
        adhar_no,
      } = req.body;

      if (
        !name ||
        !adhar_no
      ) {
        return res.status(400).json({
          error:
            "Name and Aadhaar number are required",
        });
      }

      const patient =
        await Patient.findOne({
          adhar_no:
            adhar_no.trim(),
        });

      if (!patient) {
        return res.status(404).json({
          error:
            "Patient not found",
        });
      }

      if (
        patient.name
          .trim()
          .toLowerCase() !==
        name
          .trim()
          .toLowerCase()
      ) {
        return res.status(401).json({
          error:
            "Name and Aadhaar number do not match",
        });
      }

      const token =
        createPatientToken(
          patient
        );

      res.json({
        message:
          "Login successful",

        token,

        patient,
      });

    } catch (err) {
      console.error(err);

      res.status(500).json({
        error:
          err.message,
      });
    }
  }
);


/*
====================================================
PATIENT ME
GET /api/patients/me
====================================================
*/

router.get(
  "/me",
  async (req, res) => {
    try {
      const authHeader =
        req.headers.authorization;

      if (
        !authHeader ||
        !authHeader.startsWith(
          "Bearer "
        )
      ) {
        return res.status(401).json({
          error:
            "Authentication required",
        });
      }

      const token =
        authHeader.split(" ")[1];

      const decoded =
        jwt.verify(
          token,
          JWT_SECRET
        );

      const patient =
        await Patient.findById(
          decoded.patientId
        );

      if (!patient) {
        return res.status(404).json({
          error:
            "Patient not found",
        });
      }

      res.json(patient);

    } catch (err) {
      return res.status(401).json({
        error:
          "Invalid or expired token",
      });
    }
  }
);


/*
====================================================
PATIENT BY AADHAAR
GET /api/patients/aadhar/:adhar_no
====================================================
*/

router.get(
  "/aadhar/:adhar_no",
  async (req, res) => {
    try {
      const patient =
        await Patient.findOne({
          adhar_no:
            req.params.adhar_no,
        });

      if (!patient) {
        return res.status(404).json({
          error:
            "Patient not found",
        });
      }

      res.json(patient);

    } catch (err) {
      res.status(500).json({
        error:
          err.message,
      });
    }
  }
);


/*
====================================================
PATIENT APPOINTMENTS
GET /api/patients/:id/appointments
====================================================
*/

router.get(
  "/:id/appointments",
  async (req, res) => {
    try {
      const appointments =
        await Appointment.find({
          patientId:
            req.params.id,
        })
          .sort({
            createdAt: -1,
          });

      res.json(
        appointments
      );

    } catch (err) {
      res.status(500).json({
        error:
          err.message,
      });
    }
  }
);


/*
====================================================
PATIENT LIVE QUEUE
GET /api/patients/queue/:appointmentId
====================================================
*/

router.get(
  "/queue/:appointmentId",
  async (req, res) => {
    try {
      const appointment =
        await Appointment.findById(
          req.params.appointmentId
        );

      if (!appointment) {
        return res.status(404).json({
          message:
            "Appointment not found",
        });
      }

      /*
      ----------------------------------------------
      DOCTOR ID
      ----------------------------------------------
      */

      const doctorId =
        appointment.doctorId;

      /*
      If old appointment does not have
      doctorId, queue cannot be calculated.
      */

      if (!doctorId) {
        return res.json({
          success: true,

          currentToken:
            null,

          myToken:
            appointment
              .patientSnapshot
              ?.tokenNumber ??
            null,

          patientsAhead:
            null,

          queuePosition:
            null,

          estimatedWaitMinutes:
            null,

          message:
            "Doctor information is missing for this appointment.",
        });
      }


      /*
      ----------------------------------------------
      GET SAME DOCTOR QUEUE
      ----------------------------------------------
      */

      const queue =
        await Appointment.find({
          doctorId: doctorId,

          "patientSnapshot.status": {
            $in: [
              "pending",
              "waiting",
              "in-progress",
            ],
          },
        }).sort({
          "patientSnapshot.tokenNumber":
            1,
        });


      /*
      ----------------------------------------------
      CURRENT PATIENT
      ----------------------------------------------
      */

      const current =
        queue.find(
          (item) =>
            item.patientSnapshot
              ?.status ===
            "in-progress"
        );

      const currentToken =
        current
          ?.patientSnapshot
          ?.tokenNumber ??
        null;


      /*
      ----------------------------------------------
      MY TOKEN
      ----------------------------------------------
      */

      const myToken =
        Number(
          appointment
            .patientSnapshot
            ?.tokenNumber
        );


      /*
      ----------------------------------------------
      PATIENTS AHEAD
      ----------------------------------------------
      */

      let patientsAhead = 0;

      if (
        appointment
          .patientSnapshot
          ?.status === "pending" ||
        appointment
          .patientSnapshot
          ?.status === "waiting"
      ) {

        patientsAhead =
          queue.filter(
            (item) => {

              const itemStatus =
                item
                  .patientSnapshot
                  ?.status;

              const itemToken =
                Number(
                  item
                    .patientSnapshot
                    ?.tokenNumber
                );

              /*
              Patient with smaller token
              is ahead.
              */

              return (
                item._id
                  .toString() !==
                  appointment._id
                    .toString() &&

                itemStatus !==
                  "completed" &&

                itemStatus !==
                  "cancelled" &&

                itemStatus !==
                  "done" &&

                itemToken <
                  myToken
              );
            }
          ).length;
      }


      /*
      ----------------------------------------------
      QUEUE POSITION
      ----------------------------------------------
      */

      const queuePosition =
        appointment
          .patientSnapshot
          ?.status ===
        "in-progress"

          ? 1

          : patientsAhead + 1;


      /*
      ----------------------------------------------
      ESTIMATED WAIT
      ----------------------------------------------
      5 MINUTES PER PATIENT
      ----------------------------------------------
      */

      const estimatedWaitMinutes =
        appointment
          .patientSnapshot
          ?.status ===
        "in-progress"

          ? 0

          : patientsAhead * 5;


      /*
      ----------------------------------------------
      RESPONSE
      ----------------------------------------------
      */

      res.json({
        success: true,

        currentToken,

        myToken,

        patientsAhead,

        queuePosition,

        estimatedWaitMinutes,

        status:
          appointment
            .patientSnapshot
            ?.status,
      });

    } catch (error) {

      console.error(
        "Patient queue error:",
        error
      );

      res.status(500).json({
        message:
          error.message,
      });
    }
  }
);


/*
====================================================
PATIENT BY ID
GET /api/patients/:id
====================================================
*/

router.get(
  "/:id",
  async (req, res) => {
    try {
      const patient =
        await Patient.findById(
          req.params.id
        );

      if (!patient) {
        return res.status(404).json({
          error:
            "Patient not found",
        });
      }

      res.json(patient);

    } catch (err) {
      res.status(500).json({
        error:
          err.message,
      });
    }
  }
);


/*
====================================================
UPDATE PATIENT
PUT /api/patients/:id
====================================================
*/

router.put(
  "/:id",
  async (req, res) => {
    try {
      const allowedFields = [
        "name",
        "fatherName",
        "age",
        "gender",
        "phone",
        "address",
        "email",
        "bloodGroup",
        "allergies",
        "medicines",
        "medicalHistory",
        "emergencyContact",
      ];

      const updateData = {};

      allowedFields.forEach(
        (field) => {
          if (
            req.body[field] !==
            undefined
          ) {
            updateData[field] =
              req.body[field];
          }
        }
      );

      const updated =
        await Patient.findByIdAndUpdate(
          req.params.id,

          updateData,

          {
            new: true,
            runValidators: true,
          }
        );

      if (!updated) {
        return res.status(404).json({
          error:
            "Patient not found",
        });
      }

      res.json(updated);

    } catch (err) {
      res.status(500).json({
        error:
          err.message,
      });
    }
  }
);


/*
====================================================
DELETE PATIENT
DELETE /api/patients/:id
====================================================
*/

router.delete(
  "/:id",
  async (req, res) => {
    try {

      await Patient.findByIdAndDelete(
        req.params.id
      );

      await Appointment.deleteMany({
        patientId:
          req.params.id,
      });

      res.json({
        message:
          "Patient deleted successfully",
      });

    } catch (err) {
      res.status(500).json({
        error:
          err.message,
      });
    }
  }
);


/*
====================================================
CREATE APPOINTMENT
POST /api/patients/:id/appointment
====================================================
*/

router.post(
  "/:id/appointment",
  async (req, res) => {
    try {

      const patient =
        await Patient.findById(
          req.params.id
        );

      if (!patient) {
        return res.status(404).json({
          error:
            "Patient not found",
        });
      }


      /*
      ----------------------------------------------
      TODAY
      ----------------------------------------------
      */

      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );


      /*
      ----------------------------------------------
      TOKEN NUMBER
      ----------------------------------------------
      */

      const count =
        await Appointment.countDocuments({
          "patientSnapshot.visitDate":
            {
              $gte: today,
            },

          "patientSnapshot.department":
            req.body.department,
        });

      const tokenNumber =
        count + 1;


      /*
      ----------------------------------------------
      DATA
      ----------------------------------------------
      */

      const {
        department,
        roomNo,
        doctor,
        doctorId,
        hospitalId,
        disease,
      } = req.body;


      /*
      ----------------------------------------------
      CREATE APPOINTMENT
      ----------------------------------------------
      */

      const newAppointment =
        new Appointment({

          patientId:
            patient._id,

          /*
          IMPORTANT:
          Save doctorId so live queue
          can find same doctor's patients.
          */

          doctorId:
            doctorId || undefined,

          hospitalId:
            hospitalId || undefined,

          patientSnapshot: {

            name:
              patient.name,

            phone:
              patient.phone,

            department,

            roomNo,

            doctor,

            disease,

            tokenNumber,

            status:
              "pending",

          },

        });


      await newAppointment.save();


      res.json(
        newAppointment
      );

    } catch (err) {

      console.error(
        "Create appointment error:",
        err
      );

      res.status(500).json({
        error:
          err.message,
      });
    }
  }
);


/*
====================================================
SINGLE APPOINTMENT
GET /api/patients/appointment/:appointmentId
====================================================
*/

router.get(
  "/appointment/:appointmentId",
  async (req, res) => {
    try {

      const appointment =
        await Appointment.findById(
          req.params.appointmentId
        )
          .populate(
            "patientId"
          );

      if (!appointment) {
        return res.status(404).json({
          error:
            "Appointment not found",
        });
      }

      res.json(
        appointment
      );

    } catch (err) {

      res.status(500).json({
        error:
          err.message,
      });
    }
  }
);


/*
====================================================
UPDATE APPOINTMENT
PUT /api/patients/appointment/:appointmentId
====================================================
*/

router.put(
  "/appointment/:appointmentId",
  async (req, res) => {
    try {

      const updated =
        await Appointment.findByIdAndUpdate(

          req.params.appointmentId,

          {
            patientSnapshot:
              req.body,
          },

          {
            new: true,
          }
        );

      if (!updated) {
        return res.status(404).json({
          error:
            "Appointment not found",
        });
      }

      res.json(
        updated
      );

    } catch (err) {

      res.status(500).json({
        error:
          err.message,
      });
    }
  }
);


/*
====================================================
MARK APPOINTMENT DONE
PUT /api/patients/appointment/:appointmentId/done
====================================================
*/

router.put(
  "/appointment/:appointmentId/done",
  async (req, res) => {
    try {

      const updated =
        await Appointment.findByIdAndUpdate(

          req.params.appointmentId,

          {
            "patientSnapshot.status":
              "done",
          },

          {
            new: true,
          }
        );

      if (!updated) {
        return res.status(404).json({
          error:
            "Appointment not found",
        });
      }

      res.json({
        message:
          "Appointment marked as done",
      });

    } catch (err) {

      res.status(500).json({
        error:
          err.message,
      });
    }
  }
);


/*
====================================================
DELETE APPOINTMENT
DELETE /api/patients/appointment/:appointmentId
====================================================
*/

router.delete(
  "/appointment/:appointmentId",
  async (req, res) => {
    try {

      await Appointment.findByIdAndDelete(
        req.params.appointmentId
      );

      res.json({
        message:
          "Appointment deleted successfully",
      });

    } catch (err) {

      res.status(500).json({
        error:
          err.message,
      });
    }
  }
);


/*
====================================================
ALL APPOINTMENTS
GET /api/patients/appointments/all
====================================================
*/

router.get(
  "/appointments/all",
  async (req, res) => {
    try {

      const appointments =
        await Appointment.find()
          .populate(
            "patientId"
          )
          .sort({
            createdAt: -1,
          });

      res.json(
        appointments
      );

    } catch (err) {

      res.status(500).json({
        error:
          err.message,
      });
    }
  }
);


export default router;

