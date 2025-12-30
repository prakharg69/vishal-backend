import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import app from "./app.js";
import { createServer } from "http";
import { Server } from "socket.io";
import Responder from "./src/models/Responder.model.js";
import User from "./src/models/User.model.js";

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5003;

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173","https://vishal-frontend-dgh2t3q1n-prakharg69s-projects.vercel.app/"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // ✅ REGISTER SOCKET (USER / RESPONDER)
  socket.on("registerResponder", async ({ responderId, role }) => {
    try {
      if (!responderId || !role) return;

      // 🔥 STORE ON SOCKET
      socket.userId = responderId;
      socket.role = role;

      if (role === "user") {
        await User.findByIdAndUpdate(responderId, {
          socketId: socket.id,
          isOnline: true,
        });
      }

      if (role === "responder") {
        await Responder.findByIdAndUpdate(responderId, {
          socketId: socket.id,
          isOnline: true,
        });
      }

      console.log(`✅ ${role} registered with socket`);
    } catch (err) {
      console.error("Register socket error:", err.message);
    }
  });

  // ✅ DISCONNECT (ROLE-AWARE)
  socket.on("disconnect", async () => {
    console.log("🔴 Socket disconnected:", socket.id);
    console.log("Role:", socket.role);
    console.log("UserId:", socket.userId);

    try {
      if (socket.role === "user") {
        await User.findByIdAndUpdate(socket.userId, {
          socketId: null,
          isOnline: false,
        });
      }

      if (socket.role === "responder") {
        await Responder.findByIdAndUpdate(socket.userId, {
          socketId: null,
          isOnline: false,
        });
      }
    } catch (err) {
      console.error("Socket disconnect error:", err.message);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
