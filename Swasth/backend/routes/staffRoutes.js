import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Staff from "../models/Staff.js";

const router = express.Router();

// Staff register (1st time only)
router.post("/register", async (req, res) => {
  try {
    const { username, password, hospitalName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const staff = new Staff({ username, password: hashedPassword, hospitalName });
    await staff.save();
    res.json({ message: "Staff registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Staff login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const staff = await Staff.findOne({ username });
    if (!staff) return res.status(400).json({ error: "Invalid username" });

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ id: staff._id, hospitalName: staff.hospitalName }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    res.json({ token, hospitalName: staff.hospitalName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
