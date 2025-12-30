import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Responder from "../models/Responder.model.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(token, "prakha1234");

    let user;

    if (decoded.role === "user") {
      user = await User.findById(decoded.id).select("-password");
    } else if (decoded.role === "responder") {
      user = await Responder.findById(decoded.id).select("-password");
    }

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;       // FULL user object
    req.role = decoded.role;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
