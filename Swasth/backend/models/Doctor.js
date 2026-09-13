import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const doctorSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

    hospitalCode: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    specialization: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      required: true,
    },

    roomNumber: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    active: {
      type: Boolean,
      default: true,
    },

    availableDays: {
      type: [String],
      default: [],
    },

    availableTime: {
      from: {
        type: String,
        default: "",
      },

      to: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(
    this.password,
    salt
  );

  next();
});

doctorSchema.methods.matchPassword = async function (
  enteredPassword
) {
  return await bcrypt.compare(
    enteredPassword,
    this.password
  );
};

const Doctor = mongoose.model(
  "Doctor",
  doctorSchema
);

export default Doctor;