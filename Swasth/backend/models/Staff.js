import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  hospitalName: { type: String, required: true }
});

export default mongoose.model("Staff", staffSchema);
