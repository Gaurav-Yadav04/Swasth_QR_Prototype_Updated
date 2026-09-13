import express from "express";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";
import verifyPatient from "../middleware/verifyPatient.js";

const router = express.Router();

/*
====================================================
CREATE APPOINTMENT
POST /api/appointments

PATIENT AUTH REQUIRED
====================================================
*/

router.post("/", verifyPatient, async (req, res) => {
  try {
    const {
      doctorId,
      hospitalId,
      disease,
    } = req.body;

    if (!doctorId || !hospitalId || !disease) {
      return res.status(400).json({
        success: false,
        message: "Doctor, hospital and disease are required",
      });
    }

    /*
    ------------------------------------------------
    Find Doctor
    ------------------------------------------------
    */

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    /*
    ------------------------------------------------
    Find Hospital
    ------------------------------------------------
    */

    const hospital = await Hospital.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    /*
    ------------------------------------------------
    Doctor availability
    ------------------------------------------------
    */

    if (doctor.active === false) {
      return res.status(400).json({
        success: false,
        message: "Doctor is currently unavailable",
      });
    }

    /*
    ------------------------------------------------
    Today's token
    ------------------------------------------------
    */

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const lastAppointment = await Appointment.findOne({
      doctorId: doctor._id,

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

    const tokenNumber =
      lastAppointment?.patientSnapshot?.tokenNumber
        ? lastAppointment.patientSnapshot.tokenNumber + 1
        : 1;

    /*
    ------------------------------------------------
    Patient information
    ------------------------------------------------
    */

    const patientName =
      req.patient.name ||
      req.patient.fullName ||
      "Patient";

    const patientPhone =
      req.patient.phone ||
      req.patient.mobile ||
      "";

    /*
    ------------------------------------------------
    Doctor department
    ------------------------------------------------
    */

    const department =
      doctor.department ||
      doctor.specialization ||
      "General";

    /*
    ------------------------------------------------
    Doctor room
    ------------------------------------------------
    */

    const roomNo =
      doctor.roomNumber ||
      doctor.room ||
      "-";

    /*
    ------------------------------------------------
    Create Appointment
    ------------------------------------------------
    */

    const appointment = await Appointment.create({
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

    /*
    ------------------------------------------------
    Response
    ------------------------------------------------
    */

    return res.status(201).json({
      success: true,

      message: "Appointment booked successfully",

      appointment,
    });
  } catch (error) {
    console.error("Create appointment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


router.get("/my", verifyPatient, async (req, res) => {
  try {
    console.log("=================================");
    console.log("PATIENT MY APPOINTMENTS");
    console.log("Logged-in Patient ID:", req.patient._id);
    console.log("Patient Name:", req.patient.name);

    const appointments = await Appointment.find({
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

    console.log(
      "Appointments Found:",
      appointments.length
    );

    console.log(
      "Appointment IDs:",
      appointments.map((item) => ({
        id: item._id,
        patientId: item.patientId,
        token:
          item.patientSnapshot?.tokenNumber,
        status:
          item.patientSnapshot?.status,
      }))
    );

    console.log("=================================");

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
});


/*
====================================================
SINGLE APPOINTMENT
GET /api/appointments/:id

PATIENT AUTH REQUIRED
====================================================
*/

router.get("/:id", verifyPatient, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,

      patientId: req.patient._id,
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
        message: "Appointment not found",
      });
    }

    return res.json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error("Single appointment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


/*
====================================================
PATIENT LIVE QUEUE
GET /api/appointments/:id/queue

PATIENT AUTH REQUIRED
====================================================
*/

router.get("/:id/queue", verifyPatient, async (req, res) => {
  try {
    /*
    ------------------------------------------------
    Find patient's appointment
    ------------------------------------------------
    */

    const appointment = await Appointment.findOne({
      _id: req.params.id,

      patientId: req.patient._id,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    /*
    ------------------------------------------------
    Find all appointments of same doctor today
    ------------------------------------------------
    */

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const queue = await Appointment.find({
      doctorId: appointment.doctorId,

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

    /*
    ------------------------------------------------
    Active queue
    ------------------------------------------------
    */

    const activeQueue = queue.filter(
      (item) =>
        item.patientSnapshot.status !== "completed"
    );

    /*
    ------------------------------------------------
    Current patient
    ------------------------------------------------
    */

    const current = queue.find(
      (item) =>
        item.patientSnapshot.status === "in-progress"
    );

    const currentToken =
      current?.patientSnapshot?.tokenNumber || 0;

    /*
    ------------------------------------------------
    My token
    ------------------------------------------------
    */

    const myToken =
      appointment.patientSnapshot.tokenNumber;

    /*
    ------------------------------------------------
    Patients ahead
    ------------------------------------------------
    */

    const ahead = activeQueue.filter(
      (item) =>
        Number(
          item.patientSnapshot.tokenNumber
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
    console.error("Patient queue error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


export default router;