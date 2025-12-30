import Request from "../models/request.model.js";
import Responder from "../models/Responder.model.js";
import Service from "../models/service.model.js";
import { io } from "../../server.js";
import User from "../models/User.model.js"
/* =========================
   CREATE REQUEST
========================= */


export const createRequest = async (req, res) => {
  try {
    const { category, message, latitude, longitude } = req.body;

    if (!category || !message || !latitude || !longitude) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 1️⃣ Find nearest responder
    const responder = await Responder.findOne({
      category,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: 10000
        }
      }
    });

    if (!responder) {
      return res.status(404).json({
        message: "No responder available nearby"
      });
    }

    // 2️⃣ Get service
    const service = await Service.findOne({
      responderId: responder._id
    });

    if (!service) {
      return res.status(404).json({
        message: "Responder service not found"
      });
    }

    // 3️⃣ Create request
    const request = await Request.create({
      userId: req.user.id,
      responderId: responder._id,
      serviceId: service._id,
      category,
      message,
      location: {
        type: "Point",
        coordinates: [longitude, latitude]
      },
      status: "pending"
    });

    // 🔥 4️⃣ REAL-TIME EMIT TO RESPONDER
    io.to(responder.socketId).emit("newRequest", request);

    console.log("📡 Sent real-time request to responder");

    res.status(201).json({
      message: "Request created successfully",
      request
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getRequestsForResponder = async (req, res) => {
  try {
    // ✅ Only responder allowed
    if (req.role !== "responder") {
      return res.status(403).json({ message: "Access denied" });
    }

    const requests = await Request.find({
      responderId: req.user.id
    })
      .populate("userId", "name email")
      .populate("serviceId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// controllers/request.controller.js

export const respondToRequest = async (req, res) => {
  try {
    if (req.user.role !== "responder") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { requestId, response, servicesProvided } = req.body;

    if (!requestId || !response || !servicesProvided?.length) {
      return res.status(400).json({
        message: "requestId, response and servicesProvided are required"
      });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.responderId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "This request is not assigned to you"
      });
    }

    if (request.status === "replied") {
      return res.status(400).json({
        message: "Request already responded"
      });
    }

    const service = await Service.findById(request.serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    for (const item of servicesProvided) {
      const available = service.services.find(
        s => s.name === item.name
      );

      if (!available) {
        return res.status(400).json({
          message: `${item.name} not available`
        });
      }

      if (item.quantity > available.quantity) {
        return res.status(400).json({
          message: `Not enough ${item.name} available`
        });
      }
    }

    servicesProvided.forEach(item => {
      const srv = service.services.find(
        s => s.name === item.name
      );
      srv.quantity -= item.quantity;
    });

    await service.save();

    request.status = "replied";
    request.response = response;
    request.servicesProvided = servicesProvided;
    await request.save();

    // 🔥 REAL-TIME TO USER ONLY
    const user = await User.findById(request.userId);
    console.log("user.socketId:",user.socketId);
    console.log("helooooooooooooooooooooo");
    
    

    if (user?.socketId) {
      console.log("📡 Emitting to user socket:", user.socketId);

      io.to(user.socketId).emit("requestReplied", {
        requestId: request._id,
        response: request.response,
        servicesProvided: request.servicesProvided,
        status: request.status
      });
    }

    res.status(200).json({
      message: "Response sent successfully",
      request
    });

  } catch (error) {
    console.error("Respond error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getMyRequests = async (req, res) => {
  try {
    // ✅ Only USER can access
    if (req.role !== "user") {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    const requests = await Request.find({
      userId: req.user._id
    })
      .populate("responderId", "name email")
      .populate("serviceId", "name address")
      .sort({ createdAt: -1 });

    res.status(200).json({
      requests
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

