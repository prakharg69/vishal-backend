import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Responder from "../models/Responder.model.js";

/* =========================
   JWT TOKEN GENERATOR
========================= */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/* =========================
   COOKIE OPTIONS (REUSABLE)
========================= */
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // true on Render
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

/* =========================
   SIGNUP
========================= */
export const signup = async (req, res) => {
  const { name, email, password, role, category } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "user") {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role
      });

      const token = generateToken(user._id, "user");

      res.cookie("token", token, cookieOptions);

      return res.status(201).json({
        success: true,
        message: "Signup successful"
      });
    }

    if (role === "responder") {
      const exists = await Responder.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: "Responder already exists" });
      }

      const responder = await Responder.create({
        name,
        email,
        password: hashedPassword,
        category,
        role
      });

      const token = generateToken(responder._id, "responder");

      res.cookie("token", token, cookieOptions);

      return res.status(201).json({
        success: true,
        message: "Signup successful"
      });
    }

    return res.status(400).json({ message: "Invalid role" });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   LOGIN
========================= */
export const login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const Model = role === "user" ? User : Responder;

    const account = await Model.findOne({ email });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(account._id, role);

    res.cookie("token", token, cookieOptions);

    return res.json({
      success: true,
      message: "Login successful"
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET CURRENT USER
========================= */
export const getMe = (req, res) => {
  res.json({
    user: req.user,
    role: req.role
  });
};

/* =========================
   LOGOUT
========================= */
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });

  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed"
    });
  }
};
