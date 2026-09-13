import mongoose from "mongoose";

const patientSnapshotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      default: "",
    },

    department: {
      type: String,
      required: true,
    },

    roomNo: {
      type: String,
      required: true,
    },

    doctor: {
      type: String,
      required: true,
    },

    disease: {
      type: String,
      required: true,
    },

    visitDate: {
      type: Date,
      default: Date.now,
    },

    tokenNumber: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["waiting", "in-progress", "completed", "cancelled"],
      default: "waiting",
    },
  },
  {
    _id: false,
  }
);

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },

    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },

    patientSnapshot: {
      type: patientSnapshotSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Appointment", appointmentSchema);