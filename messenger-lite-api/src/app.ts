// src/app.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";

import { DBconnectionHandling } from "./configs/DB.config";
import { ApiError, globalErrorHandler } from "./libs/error";
import v1_routes from "./routes/v1/v1_router";
import { connectDB } from "./configs/prisma.config";
import http from "http";
import { initSocket } from "./socket";
import messagesRouter from "./routes/v1/auth/routes/messages.route/messages.route";

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://172.21.16.3:3000",
      "http://10.81.100.22:3001",
      "http://10.81.100.22:3002",
      "http://192.168.31.152:3000",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
// // app.use(morgan("dev"));

// ----- SOCKET.IO SETUP -----
const server = http.createServer(app);
const io = initSocket(server);

// Routes

app.get("/health", async (req: Request, res: Response) => {
  res.status(200).json({ message: "Server is healthy 100%" });
});

app.use("/api/v1", v1_routes);
app.use("/api/v1/messages", messagesRouter(io));
// Catch-all for 404
app.all("/", (req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`));
});

// Global Error Handler
app.use(globalErrorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  try {
    await connectDB(); // uncomment if you want DB connected on start
    console.log("Prisma client connected");
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error("Failed to connect DB:", error);
  }
});

export default app;
