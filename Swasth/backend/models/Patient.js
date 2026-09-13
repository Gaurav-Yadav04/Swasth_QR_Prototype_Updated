import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    fatherName: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
    },

    adhar_no: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    gender: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
    },

    bloodGroup: {
      type: String,
      default: "",
    },

    allergies: {
      type: String,
      default: "None",
    },

    medicines: {
      type: String,
      default: "None",
    },

    medicalHistory: {
      type: String,
      default: "No major medical history",
    },

    emergencyContact: {
      type: String,
      default: "",
    },

    qrCode: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Patient", patientSchema);