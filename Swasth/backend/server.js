import dotenv from "dotenv";

dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import patientRoutes from "./routes/patientRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import doctorAppointmentRoutes from "./routes/doctorAppointments.js";

const app = express();

/*
====================================================
ENVIRONMENT CHECK
====================================================
*/

console.log(
  "JWT_SECRET:",
  process.env.JWT_SECRET ? "Loaded" : "Missing"
);

/*
====================================================
MIDDLEWARE
====================================================
*/

app.use(cors());
app.use(express.json());

/*
====================================================
API ROUTES
====================================================
*/

app.use("/api/patients", patientRoutes);

app.use("/api/staff", staffRoutes);

app.use("/api/hospital", hospitalRoutes);

app.use("/api/doctors", doctorRoutes);

app.use("/api/doctor", doctorAppointmentRoutes);

app.use("/api/appointments", appointmentRoutes);

/*
====================================================
TEST ROUTE
====================================================
*/

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Swasth QR API is running",
  });
});

/*
====================================================
SERVER
====================================================
*/

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("=================================");
    console.log("MongoDB Connected");
    console.log("MongoDB Database:", mongoose.connection.name);
    console.log("=================================");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API: http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error(
      "MongoDB connection error:",
      err.message
    );
  });