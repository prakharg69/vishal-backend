import express from "express";
import { createService, getMyService } from "../controllers/service.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// create service
router.post("/create", protect, createService);
router.get("/my", protect, getMyService);
export default router;
