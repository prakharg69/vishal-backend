import express from "express";
import authRoutes from "./src/routes/auth.routes.js";
import serviceRoutes from "./src/routes/service.routes.js";
import responderRoutes from "./src/routes/responder.routes.js";
import requestRoutes from "./src/routes/request.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();

app.use((req, res, next) => {
  console.log("🔥 Incoming request:", req.method, req.url);
  next();
});

app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));



app.use("/api/auth", authRoutes);
app.use("/api/service", serviceRoutes);
app.use("/api/responder", responderRoutes);
app.use("/api/request", requestRoutes);
export default app;

