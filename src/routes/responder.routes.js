import express from "express";
import { updateLocation } from "../controllers/responder.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/set-location", protect, updateLocation);

export default router;
