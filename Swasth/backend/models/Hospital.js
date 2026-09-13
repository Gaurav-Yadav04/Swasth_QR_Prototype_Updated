import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
  {
    hospitalCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    address: {
      state: {
        type: String,
        default: "",
      },

      district: {
        type: String,
        default: "",
      },

      city: {
        type: String,
        default: "",
      },

      pincode: {
        type: String,
        default: "",
      },
    },

    departments: {
      type: [String],
      default: [],
    },

    admin: {
      name: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

      password: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Hospital = mongoose.model("Hospital", hospitalSchema);

export default Hospital;