// routes/request.routes.js
import express from "express";
import {
  createRequest,
  getMyRequests,
  getRequestsForResponder,
  respondToRequest
} from "../controllers/request.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create", protect, createRequest);


router.post(
  "/respond",
  protect,
  respondToRequest
);

router.get(
  "/responder",
  protect,
  getRequestsForResponder
);
router.get("/my", protect, getMyRequests);
export default router;
